import React from 'react'

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">G</span>
              </div>
              <span className="text-xl font-bold text-gray-900">GO</span>
            </div>
            <p className="text-gray-600 text-sm max-w-md">
              基于 Monad 区块链的去中心化一元购平台，让每个人都能以极低的成本参与高价值商品的抽奖。公平、透明、安全。
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
              快速链接
            </h3>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-gray-600 hover:text-gray-900 text-sm transition-colors">
                  首页
                </a>
              </li>
              <li>
                <a href="/create" className="text-gray-600 hover:text-gray-900 text-sm transition-colors">
                  创建项目
                </a>
              </li>
              <li>
                <a href="/my-projects" className="text-gray-600 hover:text-gray-900 text-sm transition-colors">
                  我的项目
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
              支持
            </h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900 text-sm transition-colors">
                  帮助中心
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900 text-sm transition-colors">
                  联系我们
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900 text-sm transition-colors">
                  常见问题
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm">
            © 2024 GO Platform. 保留所有权利。
          </p>
          <div className="flex items-center space-x-6 mt-4 sm:mt-0">
            <span className="text-gray-500 text-sm">基于 Monad 区块链构建</span>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-gray-500 text-xs">在线</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
