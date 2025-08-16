/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CONTRACT_ADDRESS: string
  // 添加更多环境变量类型定义...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
