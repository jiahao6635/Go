import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useContract, Project } from '../hooks/useContract'
import { useWeb3 } from '../contexts/Web3Context'
import { formatMON, formatTimeRemaining, formatAddress } from '../utils/formatters'
import NetworkStatus from '../components/NetworkStatus'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'
import { ethers } from 'ethers'

interface HistoryProject extends Project {
  distributionStatus: 'completed' | 'refunded' | 'pending'
  prizeAmount?: bigint
  platformFee?: bigint
}

const ProjectHistory: React.FC = () => {
  const { isConnected, contractsInitialized } = useWeb3()
  const { contract, getProject } = useContract()
  
  const [historyProjects, setHistoryProjects] = useState<HistoryProject[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'completed' | 'refunded'>('all')
  const [totalStats, setTotalStats] = useState({
    totalProjects: 0,
    totalDistributed: 0n,
    totalRefunded: 0n,
    totalWinners: 0
  })

  useEffect(() => {
    if (isConnected && contract) {
      loadHistoryProjects()
    }
  }, [isConnected, contract])

  const loadHistoryProjects = async () => {
    try {
      setLoading(true)
      
      // 获取所有项目
      const projectCounter = await contract.projectCounter()
      const allProjects: HistoryProject[] = []
      
      let totalDistributed = 0n
      let totalRefunded = 0n
      let totalWinners = 0

      for (let i = 1; i <= Number(projectCounter); i++) {
        try {
          const project = await getProject(i)
          const now = Math.floor(Date.now() / 1000)
          
          // 只显示已结束的项目（已抽奖、已退款或已过期）
          const isFinished = project.isDrawn || 
                            project.status === 2 || // Refunded
                            (now > project.deadline && !project.isCompleted)

          if (isFinished) {
            let distributionStatus: 'completed' | 'refunded' | 'pending' = 'pending'
            let prizeAmount: bigint | undefined
            let platformFee: bigint | undefined

            if (project.isDrawn && project.winner !== ethers.ZeroAddress) {
              distributionStatus = 'completed'
              platformFee = project.currentAmount * 2n / 100n
              prizeAmount = project.currentAmount - platformFee
              totalDistributed += prizeAmount
              totalWinners++
            } else if (project.status === 2) { // Refunded
              distributionStatus = 'refunded'
              totalRefunded += project.currentAmount
            } else if (now > project.deadline && !project.isCompleted) {
              distributionStatus = 'refunded'
              totalRefunded += project.currentAmount
            }

            allProjects.push({
              ...project,
              distributionStatus,
              prizeAmount,
              platformFee
            })
          }
        } catch (error) {
          console.warn(`Failed to load project ${i}:`, error)
        }
      }

      // 按时间倒序排列
      allProjects.sort((a, b) => Number(b.deadline) - Number(a.deadline))
      
      setHistoryProjects(allProjects)
      setTotalStats({
        totalProjects: allProjects.length,
        totalDistributed,
        totalRefunded,
        totalWinners
      })
      
    } catch (error) {
      console.error('加载历史项目失败:', error)
      toast.error('加载历史项目失败')
    } finally {
      setLoading(false)
    }
  }

  const filteredProjects = historyProjects.filter(project => {
    if (filter === 'all') return true
    return project.distributionStatus === filter
  })

  const getStatusBadge = (project: HistoryProject) => {
    switch (project.distributionStatus) {
      case 'completed':
        return {
          text: '已完成抽奖',
          className: 'bg-green-100 text-green-800',
          icon: '🎉'
        }
      case 'refunded':
        return {
          text: '已退款',
          className: 'bg-blue-100 text-blue-800',
          icon: '💰'
        }
      default:
        return {
          text: '等待处理',
          className: 'bg-yellow-100 text-yellow-800',
          icon: '⏳'
        }
    }
  }

  if (!isConnected) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="text-gray-500 mb-4">请连接钱包以查看项目历史</div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <NetworkStatus />
      
      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">📈 项目历史记录</h1>
        <p className="text-gray-600">查看所有已完成项目的资金分配情况</p>
      </div>

      {/* 统计概览 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-2xl font-bold text-primary-600 mb-1">
            {totalStats.totalProjects}
          </div>
          <div className="text-sm text-gray-600">总项目数</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-2xl font-bold text-green-600 mb-1">
            {totalStats.totalWinners}
          </div>
          <div className="text-sm text-gray-600">中奖人数</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-2xl font-bold text-green-600 mb-1">
            {formatMON(totalStats.totalDistributed)}
          </div>
          <div className="text-sm text-gray-600">累计分配奖金</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-2xl font-bold text-blue-600 mb-1">
            {formatMON(totalStats.totalRefunded)}
          </div>
          <div className="text-sm text-gray-600">累计退款金额</div>
        </div>
      </div>

      {/* 筛选器 */}
      <div className="bg-white rounded-lg shadow mb-6 p-4">
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: '全部', count: historyProjects.length },
            { key: 'completed', label: '已抽奖', count: historyProjects.filter(p => p.distributionStatus === 'completed').length },
            { key: 'refunded', label: '已退款', count: historyProjects.filter(p => p.distributionStatus === 'refunded').length }
          ].map(filterOption => (
            <button
              key={filterOption.key}
              onClick={() => setFilter(filterOption.key as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === filterOption.key
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filterOption.label} ({filterOption.count})
            </button>
          ))}
        </div>
      </div>

      {/* 项目列表 */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            {filter === 'all' ? '暂无历史项目' : `暂无${filter === 'completed' ? '已抽奖' : '已退款'}的项目`}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredProjects.map(project => {
            const status = getStatusBadge(project)
            const endDate = new Date(project.deadline * 1000)
            
            return (
              <div key={project.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                <div className="p-6">
                  {/* 项目头部信息 */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                    <div className="mb-2 md:mb-0">
                      <div className="flex items-center mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 mr-3">
                          {project.name}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.className}`}>
                          <span className="mr-1">{status.icon}</span>
                          {status.text}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        项目ID: #{project.id} • 结束时间: {endDate.toLocaleDateString()}
                      </p>
                    </div>
                    <Link
                      to={`/project/${project.id}`}
                      className="btn btn-sm btn-secondary self-start md:self-auto"
                    >
                      查看详情
                    </Link>
                  </div>

                  {/* 项目统计 */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-sm">
                      <div className="text-gray-600">众筹金额</div>
                      <div className="font-semibold">{formatMON(project.currentAmount)} MON</div>
                    </div>
                    <div className="text-sm">
                      <div className="text-gray-600">参与人数</div>
                      <div className="font-semibold">{project.soldTickets} 张券</div>
                    </div>
                    <div className="text-sm">
                      <div className="text-gray-600">单券价格</div>
                      <div className="font-semibold">{formatMON(project.ticketPrice)} MON</div>
                    </div>
                    <div className="text-sm">
                      <div className="text-gray-600">完成率</div>
                      <div className="font-semibold">
                        {project.isCompleted ? '100%' : Math.floor(Number(project.currentAmount * 100n / project.totalAmount))}%
                      </div>
                    </div>
                  </div>

                  {/* 资金分配详情 */}
                  <div className="border-t pt-4">
                    {project.distributionStatus === 'completed' && (
                      <div className="bg-green-50 rounded-lg p-4">
                        <div className="flex items-start">
                          <div className="text-green-500 text-xl mr-3">🏆</div>
                          <div className="flex-1">
                            <h4 className="font-medium text-green-900 mb-2">获奖者信息</h4>
                            <div className="grid md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-green-700">获奖地址:</span>
                                <div className="font-mono bg-white rounded px-2 py-1 mt-1 break-all">
                                  {project.winner}
                                </div>
                              </div>
                              <div>
                                <span className="text-green-700">资金分配:</span>
                                <div className="mt-1 space-y-1">
                                  <div className="flex justify-between">
                                    <span>获奖者奖金:</span>
                                    <span className="font-semibold text-green-800">
                                      {formatMON(project.prizeAmount!)} MON
                                    </span>
                                  </div>
                                  <div className="flex justify-between text-xs text-gray-600">
                                    <span>平台手续费:</span>
                                    <span>{formatMON(project.platformFee!)} MON</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {project.distributionStatus === 'refunded' && (
                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="flex items-start">
                          <div className="text-blue-500 text-xl mr-3">💰</div>
                          <div className="flex-1">
                            <h4 className="font-medium text-blue-900 mb-2">退款信息</h4>
                            <div className="text-sm">
                              <div className="flex justify-between items-center">
                                <span className="text-blue-700">退款金额:</span>
                                <span className="font-semibold text-blue-800">
                                  {formatMON(project.currentAmount)} MON
                                </span>
                              </div>
                              <div className="text-xs text-blue-600 mt-1">
                                所有参与者已获得全额退款
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {project.distributionStatus === 'pending' && (
                      <div className="bg-yellow-50 rounded-lg p-4">
                        <div className="flex items-start">
                          <div className="text-yellow-500 text-xl mr-3">⏳</div>
                          <div className="flex-1">
                            <h4 className="font-medium text-yellow-900 mb-1">等待处理</h4>
                            <div className="text-sm text-yellow-700">
                              项目已过期，等待管理员处理抽奖或退款
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* 底部说明 */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-2">📋 说明</h3>
        <div className="text-sm text-gray-600 space-y-1">
          <div>• <strong>已抽奖</strong>: 项目达到目标金额并完成抽奖，资金已分配给获奖者</div>
          <div>• <strong>已退款</strong>: 项目未达到目标金额且已过期，资金已退还给参与者</div>
          <div>• <strong>等待处理</strong>: 项目已结束但等待管理员执行抽奖或退款操作</div>
          <div>• 所有资金操作均由智能合约自动执行，确保透明公正</div>
        </div>
      </div>
    </div>
  )
}

export default ProjectHistory
