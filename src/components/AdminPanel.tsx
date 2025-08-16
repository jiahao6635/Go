import React, { useState, useEffect } from 'react'
import { useContract, Project } from '../hooks/useContract'
import { useWeb3 } from '../contexts/Web3Context'
import { formatMON, formatTimeRemaining } from '../utils/formatters'
import LotteryDrawer from './LotteryDrawer'
import toast from 'react-hot-toast'

const AdminPanel: React.FC = () => {
  const { account, isConnected } = useWeb3()
  const { getActiveProjects, getProject } = useContract()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(false)
  
  // 检查是否为管理员（这里简化处理）
  const isAdmin = account === '0x742d35Cc6DbE78B94165a6Fe169a4c072C1d9A17' // 示例管理员地址

  useEffect(() => {
    if (isConnected && isAdmin) {
      loadProjects()
    }
  }, [isConnected, isAdmin])

  const loadProjects = async () => {
    try {
      setLoading(true)
      const activeProjectIds = await getActiveProjects()
      const projectsData = await Promise.all(
        activeProjectIds.map(id => getProject(id))
      )
      setProjects(projectsData)
    } catch (error) {
      console.error('加载项目失败:', error)
      toast.error('加载项目失败')
    } finally {
      setLoading(false)
    }
  }

  if (!isConnected || !isAdmin) {
    return null
  }

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <details className="relative">
        <summary className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full shadow-lg cursor-pointer transition-all list-none">
          <div className="flex items-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="ml-2 text-sm font-medium">管理</span>
          </div>
        </summary>

        <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-xl p-6 w-96 max-h-96 overflow-y-auto">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            管理员面板
          </h3>

          {loading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-gray-600">加载中...</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">暂无需要管理的项目</p>
            </div>
          ) : (
            <div className="space-y-4">
              {projects.map(project => {
                const now = Math.floor(Date.now() / 1000)
                const needsAttention = (project.soldTickets >= project.maxTickets && !project.isDrawn) ||
                                     (now > project.deadline && !project.isDrawn && project.soldTickets > 0)
                
                return (
                  <div key={project.id} className={`p-4 rounded-lg border-2 ${
                    needsAttention ? 'border-yellow-300 bg-yellow-50' : 'border-gray-200 bg-gray-50'
                  }`}>
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900 truncate">
                        {project.name}
                      </h4>
                      {needsAttention && (
                        <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full">
                          需处理
                        </span>
                      )}
                    </div>
                    
                    <div className="text-xs text-gray-600 space-y-1 mb-3">
                      <div>ID: {project.id}</div>
                      <div>售出: {project.soldTickets}/{project.maxTickets}</div>
                      <div>金额: {formatMON(project.currentAmount)} MON</div>
                      <div>状态: {project.isCompleted ? '已完成' : 
                                   now > project.deadline ? '已过期' : '进行中'}</div>
                      {!project.isCompleted && now <= project.deadline && (
                        <div>剩余: {formatTimeRemaining(project.deadline)}</div>
                      )}
                    </div>

                    {needsAttention && (
                      <div className="mt-3">
                        <LotteryDrawer 
                          project={project} 
                          onSuccess={loadProjects}
                        />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          <button
            onClick={loadProjects}
            disabled={loading}
            className="btn btn-secondary w-full mt-4"
          >
            {loading ? '刷新中...' : '刷新项目'}
          </button>
        </div>
      </details>
    </div>
  )
}

export default AdminPanel
