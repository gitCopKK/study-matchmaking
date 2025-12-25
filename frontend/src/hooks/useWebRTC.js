import { useState, useEffect, useRef, useCallback } from 'react'

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
}

export function useWebRTC(roomId, onRemoteStream) {
  const [localStream, setLocalStream] = useState(null)
  const [remoteStream, setRemoteStream] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)

  const peerConnectionRef = useRef(null)
  const wsRef = useRef(null)

  const initializeMedia = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      })
      setLocalStream(stream)
      return stream
    } catch (error) {
      console.error('Failed to get user media:', error)
      throw error
    }
  }, [])

  const createPeerConnection = useCallback((stream) => {
    const pc = new RTCPeerConnection(ICE_SERVERS)

    // Add local tracks
    stream.getTracks().forEach((track) => {
      pc.addTrack(track, stream)
    })

    // Handle incoming tracks
    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        setRemoteStream(event.streams[0])
        setIsConnected(true)
        onRemoteStream?.(event.streams[0])
      }
    }

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: 'ice-candidate',
            candidate: event.candidate,
            roomId,
          })
        )
      }
    }

    // Connection state changes
    pc.onconnectionstatechange = () => {
      setIsConnected(pc.connectionState === 'connected')
    }

    peerConnectionRef.current = pc
    return pc
  }, [roomId, onRemoteStream])

  const connect = useCallback(async () => {
    const stream = await initializeMedia()
    const pc = createPeerConnection(stream)

    // Connect to signaling server
    const token = localStorage.getItem('token')
    const ws = new WebSocket(`ws://localhost:8080/ws/video?token=${token}`)
    wsRef.current = ws

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'join', roomId }))
    }

    ws.onmessage = async (event) => {
      const data = JSON.parse(event.data)

      switch (data.type) {
        case 'user-joined':
          // Create and send offer
          const offer = await pc.createOffer()
          await pc.setLocalDescription(offer)
          ws.send(JSON.stringify({ type: 'offer', offer, roomId }))
          break

        case 'offer':
          await pc.setRemoteDescription(new RTCSessionDescription(data.offer))
          const answer = await pc.createAnswer()
          await pc.setLocalDescription(answer)
          ws.send(JSON.stringify({ type: 'answer', answer, roomId }))
          break

        case 'answer':
          await pc.setRemoteDescription(new RTCSessionDescription(data.answer))
          break

        case 'ice-candidate':
          if (data.candidate) {
            await pc.addIceCandidate(new RTCIceCandidate(data.candidate))
          }
          break

        case 'user-left':
          setIsConnected(false)
          setRemoteStream(null)
          break
      }
    }
  }, [roomId, initializeMedia, createPeerConnection])

  const disconnect = useCallback(() => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop())
      setLocalStream(null)
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close()
      peerConnectionRef.current = null
    }

    if (wsRef.current) {
      wsRef.current.send(JSON.stringify({ type: 'leave', roomId }))
      wsRef.current.close()
      wsRef.current = null
    }

    setRemoteStream(null)
    setIsConnected(false)
  }, [localStream, roomId])

  const toggleAudio = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setIsAudioEnabled(audioTrack.enabled)
      }
    }
  }, [localStream])

  const toggleVideo = useCallback(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        setIsVideoEnabled(videoTrack.enabled)
      }
    }
  }, [localStream])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [disconnect])

  return {
    localStream,
    remoteStream,
    isConnected,
    isAudioEnabled,
    isVideoEnabled,
    connect,
    disconnect,
    toggleAudio,
    toggleVideo,
  }
}

