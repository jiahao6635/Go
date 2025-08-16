import React, { useState } from 'react'
import { demoProjects, generateProjectStatus } from '../data/demoProjects'
import ProjectCard from './ProjectCard'
import toast from 'react-hot-toast'

interface DemoModeProps {
  isActive: boolean
  onToggle: (active: boolean) => void
}

const DemoMode: React.FC<DemoModeProps> = ({ isActive, onToggle }) => {
  const [projects] = useState(() => demoProjects.map(generateProjectStatus))

  const handleToggle = () => {
    if (!isActive) {
      toast.success('🎭 演示模式已开启', { duration: 3000 })
    } else {
      toast('演示模式已关闭', { duration: 2000 })
    }
    onToggle(!isActive)
  }

  if (!isActive) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={handleToggle}
          className="bg-purple-500 hover:bg-purple-600 text-white p-3 rounded-full shadow-lg transition-all hover:scale-110"
          title="开启演示模式"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.01M15 10h1.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Demo Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-6 mb-8 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold mb-2">🎭 演示模式</h2>
            <p className="text-purple-100">
              体验GO一元购平台的完整功能，无需真实区块链交易
            </p>
          </div>
          <button
            onClick={handleToggle}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg transition-all"
          >
            退出演示
          </button>
        </div>
      </div>

      {/* Demo Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="text-3xl font-bold text-blue-600 mb-2">{projects.length}</div>
          <div className="text-gray-600">演示项目</div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {projects.filter(p => p.isCompleted).length}
          </div>
          <div className="text-gray-600">已完成</div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="text-3xl font-bold text-yellow-600 mb-2">
            {projects.reduce((sum, p) => sum + p.soldTickets, 0)}
          </div>
          <div className="text-gray-600">总参与人次</div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {projects.reduce((sum, p) => sum + parseFloat(p.currentAmount), 0).toFixed(1)}
          </div>
          <div className="text-gray-600">总筹款 (MON)</div>
        </div>
      </div>

      {/* Projects Grid */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-6">热门项目</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <DemoProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </div>
  )
}

// Demo版本的ProjectCard，不连接真实区块链
const DemoProjectCard: React.FC<{ project: any }> = ({ project }) => {
  const [localSoldTickets, setLocalSoldTickets] = useState(project.soldTickets)
  const [buying, setBuying] = useState(false)

  const progress = (localSoldTickets / project.maxTickets) * 100
  const remainingTickets = project.maxTickets - localSoldTickets
  
  const formatTimeRemaining = (deadline: number) => {
    const now = Math.floor(Date.now() / 1000)
    const remaining = deadline - now
    
    if (remaining <= 0) return '已结束'
    
    const days = Math.floor(remaining / 86400)
    const hours = Math.floor((remaining % 86400) / 3600)
    
    if (days > 0) return `${days}天 ${hours}小时`
    return `${hours}小时`
  }

  const handleDemoBuy = async (count: number) => {
    setBuying(true)
    
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setLocalSoldTickets(prev => Math.min(prev + count, project.maxTickets))
    toast.success(`🎉 演示购买成功！购买了 ${count} 张抽奖券`)
    
    setBuying(false)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
      <div className="relative mb-4">
        <img
          src={project.imageUrl}
          alt={project.name}
          className="w-full h-48 object-cover rounded-lg"
        />
        <div className="absolute top-3 right-3 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
          演示项目
        </div>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-2">{project.name}</h3>
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{project.description}</p>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>进度: {progress.toFixed(1)}%</span>
          <span>{localSoldTickets}/{project.maxTickets} 张</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(progress, 100)}%` }}
          ></div>
        </div>
      </div>

      <div className="flex justify-between text-sm text-gray-600 mb-4">
        <span>⏰ {formatTimeRemaining(project.deadline)}</span>
        <span>💰 {project.ticketPrice} MON/张</span>
      </div>

      {/* Demo Action Buttons */}
      <div className="space-y-2">
        {remainingTickets > 0 && !buying ? (
          <div className="grid grid-cols-3 gap-2">
            {[1, 5, 10].map(count => (
              <button
                key={count}
                onClick={() => handleDemoBuy(count)}
                disabled={count > remainingTickets}
                className={`p-2 text-xs font-medium rounded-lg transition-all ${
                  count <= remainingTickets
                    ? 'bg-primary-500 text-white hover:bg-primary-600'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {count}张
              </button>
            ))}
          </div>
        ) : buying ? (
          <div className="bg-primary-500 text-white p-3 rounded-lg text-center">
            <div className="flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              购买中...
            </div>
          </div>
        ) : (
          <div className="bg-green-100 text-green-800 p-3 rounded-lg text-center font-medium">
            🎉 项目已售罄
          </div>
        )}
      </div>
    </div>
  )
}

export default DemoMode
