import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useContract, Project } from '../hooks/useContract'
import { useWeb3 } from '../contexts/Web3Context'
import { formatMON, formatTimeRemaining, calculateProgress } from '../utils/formatters'
import ContractDebugInfo from '../components/ContractDebugInfo'
import toast from 'react-hot-toast'

const MyProjects: React.FC = () => {
  const { account, isConnected } = useWeb3()
  const { getActiveProjects, getProject, getUserParticipation } = useContract()
  
  const [participatedProjects, setParticipatedProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isConnected && account) {
      // 添加延迟确保合约已完全初始化
      const timer = setTimeout(() => {
        loadMyProjects()
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [isConnected, account])

  const loadMyProjects = async () => {
    try {
      setLoading(true)
      
      // 获取所有活跃项目
      const activeProjectIds = await getActiveProjects()
      const projects = await Promise.all(
        activeProjectIds.map(id => getProject(id))
      )
      
      // 筛选出用户参与的项目
      const myProjects: Project[] = []
      for (const project of projects) {
        try {
          const participation = await getUserParticipation(project.id, account!)
          if (participation.ticketCount > 0) {
            myProjects.push(project)
          }
        } catch (error) {
          // 忽略获取参与情况失败的情况
        }
      }
      
      setParticipatedProjects(myProjects)
    } catch (error) {
      console.error('加载我的项目失败:', error)
      toast.error('加载我的项目失败')
    } finally {
      setLoading(false)
    }
  }

  const getProjectStatus = (project: Project) => {
    const now = Math.floor(Date.now() / 1000)
    if (project.isCompleted) {
      return { text: '已完成', color: 'success' }
    }
    if (now > project.deadline) {
      return { text: '已过期', color: 'danger' }
    }
    return { text: '进行中', color: 'primary' }
  }

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="mb-8">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">请连接钱包</h2>
            <p className="text-gray-600">连接钱包以查看您参与的项目</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ContractDebugInfo />
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">我的项目</h1>
        <p className="text-gray-600">查看您参与的所有众筹项目</p>
      </div>

      {/* User Info */}
      <div className="card mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">钱包地址</h2>
            <p className="text-gray-600 font-mono text-sm">{account}</p>
          </div>
          <button
            onClick={loadMyProjects}
            disabled={loading}
            className="btn btn-secondary"
          >
            {loading ? '刷新中...' : '刷新'}
          </button>
        </div>
      </div>

      {/* Projects List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(3).fill(0).map((_, index) => (
            <div key={index} className="card">
              <div className="shimmer h-48 rounded-lg mb-4"></div>
              <div className="shimmer h-4 rounded mb-2"></div>
              <div className="shimmer h-4 rounded w-2/3 mb-4"></div>
              <div className="shimmer h-2 rounded mb-4"></div>
              <div className="shimmer h-8 rounded"></div>
            </div>
          ))}
        </div>
      ) : participatedProjects.length === 0 ? (
        <div className="text-center py-12">
          <div className="mb-8">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无参与的项目</h3>
            <p className="text-gray-600 mb-6">您还没有参与任何众筹项目</p>
            <Link to="/" className="btn btn-primary">
              浏览项目
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              参与的项目 ({participatedProjects.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {participatedProjects.map((project) => {
              const status = getProjectStatus(project)
              const progress = calculateProgress(project.currentAmount, project.totalAmount)
              
              return (
                <div key={project.id} className="card hover:shadow-lg transition-shadow duration-200">
                  {/* Project Image */}
                  <div className="relative">
                    <img
                      src={project.imageUrl || '/placeholder-image.jpg'}
                      alt={project.name}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = 'https://via.placeholder.com/400x200?text=GO+Project'
                      }}
                    />
                    <div className={`absolute top-2 right-2 badge badge-${status.color}`}>
                      {status.text}
                    </div>
                    
                    {/* Winner Badge */}
                    {project.isCompleted && project.winner === account && (
                      <div className="absolute top-2 left-2 badge badge-success">
                        🎉 中奖了！
                      </div>
                    )}
                  </div>

                  {/* Project Info */}
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">
                      {project.name}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {project.description}
                    </p>
                  </div>

                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>进度: {progress}%</span>
                      <span>{formatMON(project.currentAmount)} / {formatMON(project.totalAmount)} MON</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex justify-between text-sm text-gray-600 mb-4">
                    <span>已售: {project.soldTickets}/{project.maxTickets}</span>
                    <span>剩余: {formatTimeRemaining(project.deadline)}</span>
                  </div>

                  {/* My Participation Info */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                    <ProjectParticipationInfo projectId={project.id} account={account || ''} />
                  </div>

                  {/* Action Button */}
                  <Link
                    to={`/project/${project.id}`}
                    className="btn btn-primary w-full"
                  >
                    查看详情
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// 子组件：显示用户在特定项目中的参与情况
const ProjectParticipationInfo: React.FC<{ projectId: number; account: string }> = ({ 
  projectId, 
  account 
}) => {
  const { getUserParticipation, getProject, contract } = useContract()
  const { isConnected } = useWeb3()
  const [participation, setParticipation] = useState<any>(null)
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      // 等待合约完全初始化
      if (!isConnected || !contract) {
        setLoading(false)
        setError('合约未连接')
        return
      }

      try {
        setError(null)
        const [participationData, projectData] = await Promise.all([
          getUserParticipation(projectId, account),
          getProject(projectId)
        ])
        setParticipation(participationData)
        setProject(projectData)
      } catch (error: any) {
        console.error('加载参与信息失败:', error)
        setError(error.message || '加载失败')
      } finally {
        setLoading(false)
      }
    }

    // 添加延迟以确保合约已完全初始化
    const timer = setTimeout(loadData, 1000)
    return () => clearTimeout(timer)
  }, [projectId, account, isConnected, contract])

  if (loading) {
    return (
      <div className="flex items-center text-sm text-gray-600">
        <div className="w-4 h-4 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin mr-2"></div>
        加载中...
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-red-600 text-sm">
        <div>⚠️ {error}</div>
        <div className="text-xs text-gray-500 mt-1">请刷新页面重试</div>
      </div>
    )
  }

  if (!participation || !project) {
    return <div className="text-gray-600 text-sm">未参与此项目</div>
  }

  const winningChance = project.soldTickets > 0 
    ? ((participation.ticketCount / project.soldTickets) * 100).toFixed(2)
    : '0.00'

  return (
    <div className="text-sm">
      <div className="text-blue-900 font-medium mb-1">我的参与</div>
      <div className="text-blue-700 space-y-1">
        <div>券数: {participation.ticketCount} 张</div>
        <div>投入: {formatMON(participation.amount)} MON</div>
        <div>中奖率: {winningChance}%</div>
      </div>
    </div>
  )
}

export default MyProjects
