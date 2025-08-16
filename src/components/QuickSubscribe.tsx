import React, { useState } from 'react'
import { useContract, Project } from '../hooks/useContract'
import { useWeb3 } from '../contexts/Web3Context'
import { formatMON } from '../utils/formatters'
import toast from 'react-hot-toast'

interface QuickSubscribeProps {
  project: Project
  onSuccess?: () => void
}

const QuickSubscribe: React.FC<QuickSubscribeProps> = ({ project, onSuccess }) => {
  const { isConnected, account } = useWeb3()
  const { buyTickets } = useContract()
  const [ticketCount, setTicketCount] = useState(1)
  const [buying, setBuying] = useState(false)



  const canBuyTickets = () => {
    const now = Math.floor(Date.now() / 1000)
    return !project.isCompleted && 
           now < project.deadline && 
           project.soldTickets < project.maxTickets &&
           isConnected
  }

  const handleQuickBuy = async (count: number) => {
    if (!canBuyTickets()) return

    setBuying(true)
    setTicketCount(count)
    
    try {
      await buyTickets(project.id, count, project.ticketPrice)
      toast.success(`成功购买 ${count} 张抽奖券！`)
      onSuccess?.()
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

  const handleCustomBuy = async () => {
    if (ticketCount <= 0) {
      toast.error('请输入有效的抽奖券数量')
      return
    }

    const remainingTickets = project.maxTickets - project.soldTickets
    if (ticketCount > remainingTickets) {
      toast.error(`剩余抽奖券不足，仅剩 ${remainingTickets} 张`)
      return
    }

    await handleQuickBuy(ticketCount)
  }

  if (!canBuyTickets()) {
    if (!isConnected) {
      return (
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <p className="text-gray-600 mb-2">请连接钱包参与项目</p>
        </div>
      )
    }
    
    const now = Math.floor(Date.now() / 1000)
    if (project.isCompleted) {
      return (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <p className="text-green-800 font-medium">🎉 项目已完成</p>
        </div>
      )
    }
    
    if (now > project.deadline) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-800 font-medium">⏰ 项目已过期</p>
        </div>
      )
    }
    
    return null
  }

  const remainingTickets = project.maxTickets - project.soldTickets
  const totalCost = project.ticketPrice * BigInt(ticketCount)

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">🎯 快速认购</h3>
      
      {/* 快速选择按钮 */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[1, 5, 10].map((count) => (
          <button
            key={count}
            onClick={() => handleQuickBuy(count)}
            disabled={buying || count > remainingTickets}
            className={`p-3 rounded-lg text-sm font-medium transition-all ${
              count <= remainingTickets
                ? 'bg-primary-500 text-white hover:bg-primary-600 active:scale-95'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {buying && ticketCount === count ? (
              <div className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <>
                <div className="font-bold">{count} 张</div>
                <div className="text-xs opacity-90">
                  {formatMON(project.ticketPrice * BigInt(count))} MON
                </div>
              </>
            )}
          </button>
        ))}
      </div>

      {/* 自定义数量 */}
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            自定义数量
          </label>
          <div className="flex space-x-2">
            <input
              type="number"
              min="1"
              max={remainingTickets}
              value={ticketCount}
              onChange={(e) => setTicketCount(parseInt(e.target.value) || 1)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="输入数量"
            />
            <button
              onClick={handleCustomBuy}
              disabled={buying || ticketCount > remainingTickets}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {buying ? '购买中...' : '购买'}
            </button>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            剩余 {remainingTickets} 张 • 总费用: {formatMON(totalCost)} MON
          </div>
        </div>
      </div>

      {/* 中奖概率 */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <div className="flex justify-between text-sm">
          <span className="text-blue-700">预计中奖概率:</span>
          <span className="font-medium text-blue-800">
            {((ticketCount / project.maxTickets) * 100).toFixed(2)}%
          </span>
        </div>
      </div>
    </div>
  )
}

export default QuickSubscribe
