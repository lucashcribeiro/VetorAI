import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: '@/auth',
        replacement: path.resolve(__dirname, 'tests/shims/auth.js'),
      },
      {
        find: 'server-only',
        replacement: path.resolve(__dirname, 'tests/shims/server-only.js'),
      },
      {
        find: 'next/server',
        replacement: path.resolve(__dirname, 'tests/shims/next-server.js'),
      },
      {
        find: 'next-auth/providers/credentials',
        replacement: path.resolve(__dirname, 'tests/shims/next-auth.js'),
      },
      {
        find: 'next-auth',
        replacement: path.resolve(__dirname, 'tests/shims/next-auth.js'),
      },
      { find: '@', replacement: path.resolve(__dirname) },
    ],
  },
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
  },
})
