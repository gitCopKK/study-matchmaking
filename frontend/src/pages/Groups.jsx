import { Users, Clock, Sparkles } from 'lucide-react'

export default function Groups() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center animate-fade-in">
      <div className="text-center max-w-md mx-auto p-8">
        {/* Icon with animated gradient background */}
        <div className="relative mb-8">
          <div className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center">
            <Users className="w-12 h-12 text-primary-500" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-accent-500 flex items-center justify-center animate-bounce">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-display font-bold mb-3 text-gradient">
          Study Groups
        </h1>
        
        {/* Coming Soon Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 mb-6">
          <Clock className="w-4 h-4" />
          <span className="font-medium">Coming Soon</span>
        </div>

        {/* Description */}
        <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
          Create study groups and schedule collaborative sessions with multiple partners at once. 
          Group chat support is coming soon to make coordination easier!
        </p>

        {/* Features Preview */}
        <div className="grid gap-3 text-left">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
              <Users className="w-4 h-4 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <p className="font-medium text-sm">Group Creation</p>
              <p className="text-xs text-slate-500">Create groups with up to 10 study partners</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <div className="w-8 h-8 rounded-lg bg-accent-100 dark:bg-accent-900/30 flex items-center justify-center flex-shrink-0">
              <Clock className="w-4 h-4 text-accent-600 dark:text-accent-400" />
            </div>
            <div>
              <p className="font-medium text-sm">Group Sessions</p>
              <p className="text-xs text-slate-500">Schedule study sessions with all group members</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="font-medium text-sm">Group Chat</p>
              <p className="text-xs text-slate-500">Communicate with all group members in one place</p>
            </div>
          </div>
        </div>

        {/* Note */}
        <p className="text-xs text-slate-500 mt-6">
          We're working hard to bring you this feature. Stay tuned!
        </p>
      </div>
    </div>
  )
}
