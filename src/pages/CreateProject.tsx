import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useContract } from '../hooks/useContract'
import { useWeb3 } from '../contexts/Web3Context'
import toast from 'react-hot-toast'

interface FormData {
  name: string
  description: string
  imageUrl: string
  totalAmount: string
  ticketPrice: string
  durationInHours: number
}

const CreateProject: React.FC = () => {
  const navigate = useNavigate()
  const { createProject, isLoading } = useContract()
  const { isConnected } = useWeb3()
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    imageUrl: '',
    totalAmount: '',
    ticketPrice: '',
    durationInHours: 24
  })

  const [errors, setErrors] = useState<Partial<FormData>>({})

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'durationInHours' ? parseInt(value) || 0 : value
    }))
    
    // Clear error when user starts typing
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {}

    if (!formData.name.trim()) {
      newErrors.name = '请输入项目名称'
    }

    if (!formData.description.trim()) {
      newErrors.description = '请输入项目描述'
    }

    if (!formData.totalAmount || isNaN(parseFloat(formData.totalAmount)) || parseFloat(formData.totalAmount) <= 0) {
      newErrors.totalAmount = '请输入有效的目标金额'
    }

    if (!formData.ticketPrice || isNaN(parseFloat(formData.ticketPrice)) || parseFloat(formData.ticketPrice) <= 0) {
      newErrors.ticketPrice = '请输入有效的抽奖券价格'
    }

    if (formData.totalAmount && formData.ticketPrice) {
      const total = parseFloat(formData.totalAmount)
      const price = parseFloat(formData.ticketPrice)
      
      // 允许小数情况下的整除（如 1/0.01=100），用浮点数除法判断是否为整数
      if (!Number.isInteger(total / price)) {
        newErrors.totalAmount = '目标金额必须是抽奖券价格的整数倍'
      }
    }

    if (formData.durationInHours <= 0) {
      newErrors.durationInHours = 1 // 使用数字而不是字符串
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isConnected) {
      toast.error('请先连接钱包')
      return
    }

    if (!validateForm()) {
      toast.error('请检查表单输入')
      return
    }

    try {
      await createProject(
        formData.name,
        formData.description,
        formData.imageUrl,
        formData.totalAmount,
        formData.ticketPrice,
        formData.durationInHours
      )
      
      toast.success('项目创建成功！')
      navigate('/')
    } catch (error: any) {
      console.error('创建项目失败:', error)
      if (error.code === 4001) {
        toast.error('用户取消交易')
      } else if (error.message?.includes('Ownable: caller is not the owner')) {
        toast.error('只有管理员可以创建项目')
      } else {
        toast.error('创建项目失败，请重试')
      }
    }
  }

  const calculateMaxTickets = () => {
    if (formData.totalAmount && formData.ticketPrice) {
      const total = parseFloat(formData.totalAmount)
      const price = parseFloat(formData.ticketPrice)
      if (total > 0 && price > 0 && total % price === 0) {
        return Math.floor(total / price)
      }
    }
    return 0
  }

  if (!isConnected) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">请连接钱包</h2>
          <p className="text-gray-600 mb-8">您需要连接钱包才能创建项目</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="card">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">创建新项目</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              项目名称 *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`input ${errors.name ? 'border-red-500' : ''}`}
              placeholder="输入项目名称"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Project Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              项目描述 *
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleInputChange}
              className={`input ${errors.description ? 'border-red-500' : ''}`}
              placeholder="详细描述您的项目..."
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          {/* Project Image URL */}
          <div>
            <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-2">
              项目图片链接
            </label>
            <input
              type="url"
              id="imageUrl"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleInputChange}
              className="input"
              placeholder="https://example.com/image.jpg"
            />
            <p className="text-gray-500 text-sm mt-1">
              可选，留空将使用默认图片
            </p>
          </div>

          {/* Total Amount */}
          <div>
            <label htmlFor="totalAmount" className="block text-sm font-medium text-gray-700 mb-2">
              目标金额 (MON) *
            </label>
            <input
              type="number"
              id="totalAmount"
              name="totalAmount"
              step="0.01"
              min="0"
              value={formData.totalAmount}
              onChange={handleInputChange}
              className={`input ${errors.totalAmount ? 'border-red-500' : ''}`}
              placeholder="100.00"
            />
            {errors.totalAmount && (
              <p className="text-red-500 text-sm mt-1">{errors.totalAmount}</p>
            )}
            <p className="text-gray-500 text-sm mt-1">
              建议设置合理的目标金额，便于用户参与
            </p>
          </div>

          {/* Ticket Price */}
          <div>
            <label htmlFor="ticketPrice" className="block text-sm font-medium text-gray-700 mb-2">
              单券价格 (MON) *
            </label>
            <input
              type="number"
              id="ticketPrice"
              name="ticketPrice"
              step="0.01"
              min="0.01"
              value={formData.ticketPrice}
              onChange={handleInputChange}
              className={`input ${errors.ticketPrice ? 'border-red-500' : ''}`}
              placeholder="1.00"
            />
            {errors.ticketPrice && (
              <p className="text-red-500 text-sm mt-1">{errors.ticketPrice}</p>
            )}
            
            {/* Max Tickets Preview */}
            {calculateMaxTickets() > 0 && (
              <p className="text-gray-500 text-sm mt-1">
                最大抽奖券数量: {calculateMaxTickets()} 张，单券价格: {formData.ticketPrice} MON
              </p>
            )}
          </div>

          {/* Duration */}
          <div>
            <label htmlFor="durationInHours" className="block text-sm font-medium text-gray-700 mb-2">
              项目持续时间 *
            </label>
            <select
              id="durationInHours"
              name="durationInHours"
              value={formData.durationInHours}
              onChange={handleInputChange}
              className="input"
            >
              <option value={1}>1 小时</option>
              <option value={6}>6 小时</option>
              <option value={12}>12 小时</option>
              <option value={24}>24 小时</option>
              <option value={48}>2 天</option>
              <option value={72}>3 天</option>
              <option value={168}>7 天</option>
            </select>
          </div>

          {/* Project Preview */}
          {formData.name && formData.totalAmount && formData.ticketPrice && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">项目预览</h3>
              <div className="text-sm text-blue-700 space-y-1">
                <p>项目名称: {formData.name}</p>
                <p>目标金额: {formData.totalAmount} MON</p>
                <p>单券价格: {formData.ticketPrice} MON</p>
                <p>最大券数: {calculateMaxTickets()} 张</p>
                <p>持续时间: {formData.durationInHours} 小时</p>
                <p>中奖概率: {calculateMaxTickets() > 0 ? (1/calculateMaxTickets() * 100).toFixed(2) : 0}% (每张券)</p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 btn btn-primary"
            >
              {isLoading ? '创建中...' : '创建项目'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex-1 btn btn-secondary"
            >
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateProject
