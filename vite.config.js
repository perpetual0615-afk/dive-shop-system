import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' // 如果您是用 Vue 就是 vue()

export default defineConfig({
  plugins: [react()],
  build: {
    // 將警告門檻調高到 1000 KB (1 MB) 或是更高的數值
    chunkSizeWarningLimit: 1000, 
  }
})