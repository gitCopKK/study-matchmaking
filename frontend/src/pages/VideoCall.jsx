import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { chatApi } from '../services/api'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Monitor,
  Maximize,
  Minimize,
} from 'lucide-react'

export default function VideoCall() {
  const { roomId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [isConnected, setIsConnected] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const [connectionStatus, setConnectionStatus] = useState('Initializing...')
  const [peerName, setPeerName] = useState('')
  
  const localVideoRef = useRef(null)
  const remoteVideoRef = useRef(null)
  const peerConnectionRef = useRef(null)
  const localStreamRef = useRef(null)
  const stompClientRef = useRef(null)
  const cleanupCalledRef = useRef(false)
  const timerRef = useRef(null)

  // Cleanup function - stops all media and connections
  const cleanup = useCallback(() => {
    if (cleanupCalledRef.current) return
    cleanupCalledRef.current = true
    
    console.log('Cleaning up video call...')
    
    // Stop timer
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    
    // Clear video elements FIRST to release references
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null
    }
    
    // Stop all media tracks - this turns off camera indicator
    if (localStreamRef.current) {
      const tracks = localStreamRef.current.getTracks()
      tracks.forEach(track => {
        track.enabled = false
        track.stop()
        console.log('Stopped track:', track.kind, track.readyState)
      })
      localStreamRef.current = null
    }
    
    // Close peer connection
    if (peerConnectionRef.current) {
      try {
        peerConnectionRef.current.close()
      } catch (e) {
        console.log('Error closing peer connection:', e)
      }
      peerConnectionRef.current = null
    }
    
    // Disconnect STOMP
    if (stompClientRef.current) {
      try {
        if (stompClientRef.current.connected) {
          stompClientRef.current.publish({
            destination: `/app/video.leave/${roomId}`,
            body: JSON.stringify({})
          })
        }
        stompClientRef.current.deactivate()
      } catch (e) {
        console.log('Error disconnecting STOMP:', e)
      }
      stompClientRef.current = null
    }
  }, [roomId])

  const endCall = useCallback(async () => {
    cleanup()
    
    try {
      await chatApi.sendMessage(roomId, `📞 Call ended • Duration: ${formatDuration(callDuration)}`)
    } catch (e) {
      console.log('Could not send call ended message:', e)
    }
    
    navigate('/chat/' + roomId)
  }, [roomId, callDuration, cleanup, navigate])

  const setupPeerConnection = useCallback((stream) => {
    const configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    }
    
    const pc = new RTCPeerConnection(configuration)
    peerConnectionRef.current = pc

    stream.getTracks().forEach(track => {
      pc.addTrack(track, stream)
    })

    pc.ontrack = (event) => {
      console.log('Received remote track:', event.track.kind)
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0]
        setIsConnected(true)
        setConnectionStatus('Connected')
      }
    }

    pc.onicecandidate = (event) => {
      if (event.candidate && stompClientRef.current?.connected) {
        stompClientRef.current.publish({
          destination: `/app/video.ice/${roomId}`,
          body: JSON.stringify({ candidate: event.candidate })
        })
      }
    }

    pc.onconnectionstatechange = () => {
      console.log('Connection state:', pc.connectionState)
      switch (pc.connectionState) {
        case 'connected':
          setIsConnected(true)
          setConnectionStatus('Connected')
          break
        case 'disconnected':
          setConnectionStatus('Peer disconnected')
          setIsConnected(false)
          break
        case 'failed':
          setConnectionStatus('Connection failed')
          setIsConnected(false)
          break
        case 'closed':
          setConnectionStatus('Call ended')
          setIsConnected(false)
          break
      }
    }

    return pc
  }, [roomId])

  const startCall = useCallback(async () => {
    if (cleanupCalledRef.current) return
    
    try {
      setConnectionStatus('Requesting camera access...')
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      })
      
      if (cleanupCalledRef.current) {
        stream.getTracks().forEach(track => track.stop())
        return
      }
      
      localStreamRef.current = stream
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }

      setConnectionStatus('Connecting...')

      const pc = setupPeerConnection(stream)
      
      if (cleanupCalledRef.current) {
        pc.close()
        stream.getTracks().forEach(track => track.stop())
        return
      }

      const token = localStorage.getItem('token')
      const client = new Client({
        webSocketFactory: () => new SockJS('/ws'),
        connectHeaders: {
          Authorization: `Bearer ${token}`,
        },
        debug: () => {},
        reconnectDelay: 5000,
      })

      client.onConnect = async () => {
        if (cleanupCalledRef.current) return
        
        console.log('STOMP connected for video')
        setConnectionStatus('Waiting for peer to join...')
        
        client.subscribe(`/topic/video/${roomId}`, async (message) => {
          if (cleanupCalledRef.current) return
          
          const data = JSON.parse(message.body)
          const myId = user?.id?.toString()

          switch (data.type) {
            case 'user-joined':
              if (data.userId !== myId) {
                console.log('Peer joined:', data.displayName)
                setPeerName(data.displayName || 'Peer')
                setConnectionStatus('Connecting to ' + (data.displayName || 'peer') + '...')
                
                try {
                  const offer = await pc.createOffer()
                  await pc.setLocalDescription(offer)
                  client.publish({
                    destination: `/app/video.offer/${roomId}`,
                    body: JSON.stringify({ offer })
                  })
                } catch (err) {
                  console.error('Error creating offer:', err)
                }
              }
              break

            case 'offer':
              if (data.userId !== myId) {
                console.log('Received offer')
                try {
                  await pc.setRemoteDescription(new RTCSessionDescription(data.offer))
                  const answer = await pc.createAnswer()
                  await pc.setLocalDescription(answer)
                  client.publish({
                    destination: `/app/video.answer/${roomId}`,
                    body: JSON.stringify({ answer })
                  })
                } catch (err) {
                  console.error('Error handling offer:', err)
                }
              }
              break

            case 'answer':
              if (data.userId !== myId) {
                console.log('Received answer')
                try {
                  await pc.setRemoteDescription(new RTCSessionDescription(data.answer))
                } catch (err) {
                  console.error('Error handling answer:', err)
                }
              }
              break

            case 'ice-candidate':
              if (data.userId !== myId && data.candidate) {
                try {
                  await pc.addIceCandidate(new RTCIceCandidate(data.candidate))
                } catch (err) {
                  console.error('Error adding ICE candidate:', err)
                }
              }
              break

            case 'user-left':
              if (data.userId !== myId) {
                console.log('Peer left the call')
                setIsConnected(false)
                setConnectionStatus('Peer left the call')
                if (remoteVideoRef.current) {
                  remoteVideoRef.current.srcObject = null
                }
              }
              break
          }
        })

        client.publish({
          destination: `/app/video.join/${roomId}`,
          body: JSON.stringify({})
        })
      }

      client.onStompError = (frame) => {
        console.error('STOMP error:', frame.headers?.message)
        setConnectionStatus('Connection error')
      }

      client.activate()
      stompClientRef.current = client

    } catch (error) {
      console.error('Failed to start call:', error)
      if (error.name === 'NotAllowedError') {
        setConnectionStatus('Camera/microphone access denied')
      } else if (error.name === 'NotFoundError') {
        setConnectionStatus('No camera/microphone found')
      } else {
        setConnectionStatus('Failed to start call: ' + error.message)
      }
    }
  }, [roomId, setupPeerConnection, user?.id])

  useEffect(() => {
    cleanupCalledRef.current = false
    startCall()

    timerRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1)
    }, 1000)

    return cleanup
  }, [startCall, cleanup])

  useEffect(() => {
    const handleBeforeUnload = () => {
      cleanup()
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [cleanup])

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setIsAudioEnabled(audioTrack.enabled)
      }
    }
  }

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        setIsVideoEnabled(videoTrack.enabled)
      }
    }
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="fixed inset-0 bg-slate-900 z-50 flex flex-col">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-10 bg-gradient-to-b from-black/50 to-transparent">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-white">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-yellow-500'} ${isConnected ? 'animate-pulse' : ''}`} />
            <span className="text-sm font-medium">
              {isConnected ? `Connected with ${peerName || 'Peer'}` : connectionStatus}
            </span>
          </div>
          <span className="text-white/70 text-sm font-mono">{formatDuration(callDuration)}</span>
        </div>

        <button
          onClick={toggleFullscreen}
          className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
        >
          {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
        </button>
      </div>

      {/* Video Grid */}
      <div className="flex-1 flex items-center justify-center p-4 pt-16">
        <div className="relative w-full max-w-5xl aspect-video">
          {/* Remote Video (Main) */}
          <div className="w-full h-full rounded-2xl overflow-hidden bg-slate-800 relative">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className={`w-full h-full object-cover ${!isConnected ? 'hidden' : ''}`}
            />
            {!isConnected && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
                    <Video className="w-12 h-12 animate-pulse" />
                  </div>
                  <p className="text-xl font-medium mb-2">{connectionStatus}</p>
                  <p className="text-sm text-white/60">Make sure the other person clicks "Join Call"</p>
                </div>
              </div>
            )}
            {isConnected && peerName && (
              <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-black/50 text-white text-sm font-medium">
                {peerName}
              </div>
            )}
          </div>

          {/* Local Video (Picture-in-Picture) */}
          <div className="absolute bottom-4 right-4 w-48 aspect-video rounded-xl overflow-hidden shadow-2xl bg-slate-700 border-2 border-white/20">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${!isVideoEnabled ? 'hidden' : ''}`}
            />
            {!isVideoEnabled && (
              <div className="w-full h-full flex items-center justify-center bg-slate-800">
                <div className="w-12 h-12 rounded-full bg-slate-600 flex items-center justify-center text-white text-lg font-medium">
                  {user?.displayName?.charAt(0) || '?'}
                </div>
              </div>
            )}
            <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-black/60 text-white text-xs font-medium">
              You
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-6 flex items-center justify-center gap-4 bg-gradient-to-t from-black/70 to-transparent">
        <button
          onClick={toggleAudio}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
            isAudioEnabled
              ? 'bg-white/20 text-white hover:bg-white/30'
              : 'bg-red-500 text-white hover:bg-red-600'
          }`}
          title={isAudioEnabled ? 'Mute microphone' : 'Unmute microphone'}
        >
          {isAudioEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
        </button>

        <button
          onClick={toggleVideo}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
            isVideoEnabled
              ? 'bg-white/20 text-white hover:bg-white/30'
              : 'bg-red-500 text-white hover:bg-red-600'
          }`}
          title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
        >
          {isVideoEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
        </button>

        <button
          className="w-14 h-14 rounded-full bg-white/20 text-white hover:bg-white/30 flex items-center justify-center transition-all opacity-50 cursor-not-allowed"
          title="Screen share (coming soon)"
          disabled
        >
          <Monitor className="w-6 h-6" />
        </button>

        <button
          onClick={endCall}
          className="w-16 h-16 rounded-full bg-red-500 text-white hover:bg-red-600 flex items-center justify-center transition-all shadow-lg shadow-red-500/30"
          title="End call"
        >
          <PhoneOff className="w-7 h-7" />
        </button>
      </div>
    </div>
  )
}
