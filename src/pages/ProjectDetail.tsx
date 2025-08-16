import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useContract, Project, Participant } from '../hooks/useContract'
import { useWeb3 } from '../contexts/Web3Context'
import QuickSubscribe from '../components/QuickSubscribe'
import NetworkStatus from '../components/NetworkStatus'
import { formatMON, formatTimeRemaining, calculateProgress } from '../utils/formatters'
import toast from 'react-hot-toast'

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { account, isConnected, contractsInitialized } = useWeb3()
  const { getProject, buyTickets, getUserParticipation, getProjectParticipants, processRefund, isLoading, contract } = useContract()
  
  const [project, setProject] = useState<Project | null>(null)
  const [userParticipation, setUserParticipation] = useState<Participant | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [ticketCount, setTicketCount] = useState<number>(1)
  const [loading, setLoading] = useState(true)
  const [buying, setBuying] = useState(false)

  useEffect(() => {
    if (id && isConnected && contract) {
      loadProject(parseInt(id))
    }
  }, [id, account, isConnected, contract])

  const loadProject = async (projectId: number) => {
    if (!isConnected || !contract) {
      toast.error('请先连接钱包')
      return
    }

    try {
      setLoading(true)
      const projectData = await getProject(projectId)
      setProject(projectData)

      // 加载参与者信息
      const participantsData = await getProjectParticipants(projectId)
      setParticipants(participantsData)

      // 如果用户已连接钱包，加载用户参与情况
      if (account) {
        const userParticipationData = await getUserParticipation(projectId, account)
        setUserParticipation(userParticipationData)
      }
    } catch (error: any) {
      console.error('加载项目失败:', error)
      if (error.message?.includes('请先连接钱包')) {
        toast.error('请先连接钱包并切换到正确网络')
      } else {
        toast.error('加载项目失败：' + error.message)
      }
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  const handleBuyTickets = async () => {
    if (!project || !isConnected) {
      toast.error('请先连接钱包')
      return
    }

    if (ticketCount <= 0) {
      toast.error('请输入有效的抽奖券数量')
      return
    }

    const remainingTickets = project.maxTickets - project.soldTickets
    if (ticketCount > remainingTickets) {
      toast.error(`剩余抽奖券不足，仅剩 ${remainingTickets} 张`)
      return
    }

    setBuying(true)
    try {
      await buyTickets(project.id, ticketCount, project.ticketPrice)
      toast.success(`成功购买 ${ticketCount} 张抽奖券！`)
      
      // 重新加载项目数据
      await loadProject(project.id)
      setTicketCount(1)
    } catch (error: any) {
      console.error('购买失败:', error)
      if (error.code === 4001) {
        toast.error('用户取消交易')
      } else if (error.message?.includes('insufficient funds')) {
        toast.error('余额不足')
      } else {
        toast.error('购买失败，请重试')
      }
    } finally {
      setBuying(false)
    }
  }

  const handleRefund = async () => {
    if (!project || !isConnected) return

    try {
      await processRefund(project.id)
      toast.success('退款处理成功！')
      await loadProject(project.id)
    } catch (error) {
      console.error('退款失败:', error)
      toast.error('退款处理失败')
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

  const canBuyTickets = (project: Project) => {
    const now = Math.floor(Date.now() / 1000)
    return !project.isCompleted && now < project.deadline && project.soldTickets < project.maxTickets
  }

  const canRefund = (project: Project) => {
    const now = Math.floor(Date.now() / 1000)
    return !project.isCompleted && now > project.deadline && project.status === 0
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <NetworkStatus />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="shimmer h-96 rounded-lg"></div>
          <div>
            <div className="shimmer h-8 rounded mb-4"></div>
            <div className="shimmer h-4 rounded mb-2"></div>
            <div className="shimmer h-4 rounded mb-4"></div>
            <div className="shimmer h-16 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <NetworkStatus />
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">项目不存在或加载失败</h2>
          <p className="text-gray-600 mb-6">请确保已连接钱包并切换到正确网络</p>
          <div className="space-x-4">
            <button onClick={() => navigate('/')} className="btn btn-primary">
              返回首页
            </button>
            <button 
              onClick={() => window.location.reload()} 
              className="btn btn-secondary"
            >
              重新加载
            </button>
          </div>
        </div>
      </div>
    )
  }

  const status = getProjectStatus(project)
  const progress = calculateProgress(project.currentAmount, project.totalAmount)
  const totalCost = project.ticketPrice * BigInt(ticketCount)

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <NetworkStatus />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Project Image and Details */}
        <div>
          <div className="relative mb-6">
            <img
              src={project.imageUrl || '/placeholder-image.jpg'}
              alt={project.name}
              className="w-full h-96 object-cover rounded-xl"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = '/placeholder-image.jpg'
              }}
            />
            <div className={`absolute top-4 right-4 badge badge-${status.color}`}>
              {status.text}
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {project.name}
          </h1>
          
          <p className="text-gray-600 mb-6 leading-relaxed">
            {project.description}
          </p>

          {/* Project Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="card">
              <div className="text-sm text-gray-600 mb-1">目标金额</div>
              <div className="text-lg font-semibold">{formatMON(project.totalAmount)} MON</div>
            </div>
            <div className="card">
              <div className="text-sm text-gray-600 mb-1">单券价格</div>
              <div className="text-lg font-semibold">{formatMON(project.ticketPrice)} MON</div>
            </div>
            <div className="card">
              <div className="text-sm text-gray-600 mb-1">已售数量</div>
              <div className="text-lg font-semibold">{project.soldTickets} / {project.maxTickets}</div>
            </div>
            <div className="card">
              <div className="text-sm text-gray-600 mb-1">剩余时间</div>
              <div className="text-lg font-semibold">{formatTimeRemaining(project.deadline)}</div>
            </div>
          </div>
        </div>

        {/* Purchase Panel */}
        <div>
          {/* Quick Subscribe Component */}
          <div className="mb-6">
            <QuickSubscribe project={project} onSuccess={() => loadProject(project.id)} />
          </div>
          
          <div className="card mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">项目进度</h2>
            
            {/* Progress Bar */}
            <div className="mb-4">
                          <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>进度: {progress}%</span>
              <span>{formatMON(project.currentAmount)} / {formatMON(project.totalAmount)} MON</span>
            </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-primary-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                ></div>
              </div>
            </div>

            {/* User Participation */}
            {isConnected && userParticipation && userParticipation.ticketCount > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h3 className="font-medium text-blue-900 mb-2">我的参与情况</h3>
                <div className="text-sm text-blue-700">
                  <p>购买券数: {userParticipation.ticketCount} 张</p>
                  <p>投入金额: {formatMON(userParticipation.amount)} MON</p>
                  <p>中奖概率: {((userParticipation.ticketCount / project.soldTickets) * 100).toFixed(2)}%</p>
                </div>
              </div>
            )}

            {/* Winner Info */}
            {project.isCompleted && project.winner !== '0x0000000000000000000000000000000000000000' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <h3 className="font-medium text-green-900 mb-2">🎉 中奖者</h3>
                <p className="text-sm text-green-700 font-mono">
                  {project.winner}
                </p>
                <p className="text-sm text-green-600 mt-1">
                  奖金: {formatMON(project.totalAmount * 98n / 100n)} MON (扣除2%平台费)
                </p>
              </div>
            )}

            {/* Purchase Form */}
            {canBuyTickets(project) && isConnected && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    购买数量
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={project.maxTickets - project.soldTickets}
                    value={ticketCount}
                    onChange={(e) => setTicketCount(parseInt(e.target.value) || 1)}
                    className="input"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    剩余 {project.maxTickets - project.soldTickets} 张抽奖券
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between text-sm">
                    <span>总费用:</span>
                    <span className="font-medium">{formatEther(totalCost)} ETH</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>中奖概率:</span>
                    <span className="font-medium">
                      {((ticketCount / project.maxTickets) * 100).toFixed(2)}%
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleBuyTickets}
                  disabled={buying || isLoading}
                  className="btn btn-primary w-full"
                >
                  {buying ? '购买中...' : `购买 ${ticketCount} 张抽奖券`}
                </button>
              </div>
            )}

            {/* Refund Button */}
            {canRefund(project) && isConnected && userParticipation && userParticipation.ticketCount > 0 && (
              <button
                onClick={handleRefund}
                disabled={isLoading}
                className="btn btn-danger w-full"
              >
                {isLoading ? '处理中...' : '申请退款'}
              </button>
            )}

            {/* Connect Wallet Prompt */}
            {!isConnected && (
              <div className="text-center py-6">
                <p className="text-gray-600 mb-4">请连接钱包以参与项目</p>
              </div>
            )}
          </div>

          {/* Participants List */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              参与者 ({participants.length})
            </h3>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {participants.length === 0 ? (
                <p className="text-gray-500 text-center py-4">暂无参与者</p>
              ) : (
                participants.map((participant, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-mono text-sm text-gray-900">
                        {participant.user.slice(0, 8)}...{participant.user.slice(-6)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{participant.ticketCount} 张</div>
                      <div className="text-xs text-gray-500">
                        {formatMON(participant.amount)} MON
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProjectDetail
