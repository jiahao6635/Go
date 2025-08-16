import React, { useState } from 'react'
import { useContract, Project } from '../hooks/useContract'
import { useWeb3 } from '../contexts/Web3Context'
import { formatMON } from '../utils/formatters'
import toast from 'react-hot-toast'

interface LotteryDrawerProps {
  project: Project
  onSuccess?: () => void
}

const LotteryDrawer: React.FC<LotteryDrawerProps> = ({ project, onSuccess }) => {
  const { account, isConnected } = useWeb3()
  const { drawLottery, isLoading } = useContract()
  const [drawing, setDrawing] = useState(false)
  
  // 检查是否为管理员（这里简化处理，实际应该从合约获取）
  const isAdmin = account === '0x742d35Cc6DbE78B94165a6Fe169a4c072C1d9A17' // 示例管理员地址

  const canDraw = () => {
    const now = Math.floor(Date.now() / 1000)
    return project.soldTickets >= project.maxTickets && // 售罄
           !project.isDrawn && // 未抽奖
           isConnected &&
           isAdmin
  }

  const canManualDraw = () => {
    const now = Math.floor(Date.now() / 1000)
    return now > project.deadline && // 已过期
           !project.isDrawn && // 未抽奖
           project.soldTickets > 0 && // 有参与者
           isConnected &&
           isAdmin
  }

  const handleDraw = async () => {
    setDrawing(true)
    try {
      await drawLottery(project.id)
      toast.success('🎉 抽奖完成！获奖者已产生')
      onSuccess?.()
    } catch (error: any) {
      console.error('抽奖失败:', error)
      if (error.message?.includes('Only owner')) {
        toast.error('只有管理员可以进行抽奖')
      } else if (error.message?.includes('Already drawn')) {
        toast.error('该项目已经完成抽奖')
      } else {
        toast.error('抽奖失败，请重试')
      }
    } finally {
      setDrawing(false)
    }
  }

  if (!isAdmin) {
    return null // 非管理员不显示
  }

  if (project.isDrawn) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 shadow-sm">
        <div className="text-center">
          <div className="text-4xl mb-3">🎉</div>
          <h3 className="text-lg font-semibold text-green-900 mb-2">抽奖已完成</h3>
          <p className="text-green-700 mb-4">获奖者已确定并发放奖金</p>
          <div className="bg-white rounded-lg p-3">
            <p className="text-sm text-gray-600 mb-1">获奖者地址：</p>
            <p className="font-mono text-sm text-gray-900 break-all">
              {project.winner}
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (canDraw()) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 shadow-sm">
        <div className="text-center">
          <div className="text-4xl mb-3">🎯</div>
          <h3 className="text-lg font-semibold text-yellow-900 mb-2">项目已售罄</h3>
          <p className="text-yellow-700 mb-4">
            所有抽奖券已售完，可以进行抽奖了！
          </p>
          
          <div className="bg-white rounded-lg p-4 mb-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">参与人数：</span>
                <span className="font-medium">{project.soldTickets} 人</span>
              </div>
              <div>
                <span className="text-gray-600">奖池金额：</span>
                <span className="font-medium">{formatMON(project.totalAmount * 98n / 100n)} MON</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleDraw}
            disabled={drawing || isLoading}
            className="btn btn-primary w-full text-lg py-3"
          >
            {drawing ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                抽奖中...
              </div>
            ) : (
              '🎲 立即抽奖'
            )}
          </button>
        </div>
      </div>
    )
  }

  if (canManualDraw()) {
    return (
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 shadow-sm">
        <div className="text-center">
          <div className="text-4xl mb-3">⏰</div>
          <h3 className="text-lg font-semibold text-orange-900 mb-2">项目已过期</h3>
          <p className="text-orange-700 mb-4">
            项目时间已到，可以手动触发抽奖
          </p>
          
          <div className="bg-white rounded-lg p-4 mb-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">参与人数：</span>
                <span className="font-medium">{project.soldTickets} 人</span>
              </div>
              <div>
                <span className="text-gray-600">完成度：</span>
                <span className="font-medium">
                  {Math.round(Number(project.currentAmount * 100n / project.totalAmount))}%
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handleDraw}
            disabled={drawing || isLoading}
            className="btn btn-warning w-full text-lg py-3"
          >
            {drawing ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                抽奖中...
              </div>
            ) : (
              '🎲 手动抽奖'
            )}
          </button>
        </div>
      </div>
    )
  }

  return null
}

export default LotteryDrawer
