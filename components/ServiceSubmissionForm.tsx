"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/AuthProvider"

export default function ServiceSubmissionForm() {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    chatgpt_account: '',
    chatgpt_payment_url: '',
    claude_email: '',
    service_type: 'ChatGPT免费版代开通35'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  const serviceOptions = [
    "ChatGPT免费版代开通35",
    "ChatGPT共享版 ¥65/月",
    "ChatGPT独享代充 ¥169/月",
    "ChatGPTPro专业版 ¥1500/月",
    "Claude code 新号申请 ¥29/一次性",
    "Claude code 日付套餐 ¥13/天",
    "Claude code 周付套餐 ¥130/周",
    "Claude code月付套餐 ¥320/月"
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage('')

    try {
      const { error } = await supabase
        .from('service_submissions')
        .insert({
          user_id: user?.id || null,
          chatgpt_account: formData.chatgpt_account || null,
          chatgpt_payment_url: formData.chatgpt_payment_url || null,
          claude_email: formData.claude_email || null,
          service_type: formData.service_type
        })

      if (error) {
        console.error('Supabase error:', error)
        setMessage('提交失败，请稍后重试')
      } else {
        setMessage('提交成功！我们将尽快为您处理')
        setFormData({
          chatgpt_account: '',
          chatgpt_payment_url: '',
          claude_email: '',
          service_type: 'ChatGPT免费版代开通35'
        })
      }
    } catch (error) {
      console.error('Catch error:', error)
      setMessage('提交失败，请稍后重试')
    }

    setIsSubmitting(false)
  }

  return (
    <div style={{
      backgroundColor: '#f8f9fa',
      padding: '30px',
      borderRadius: '8px',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      {/* 标题 */}
      <div style={{
        backgroundColor: '#007bff',
        color: 'white',
        padding: '12px 20px',
        borderRadius: '4px',
        marginBottom: '30px',
        fontSize: '18px',
        fontWeight: 'bold'
      }}>
        按购买服务填写
      </div>

      {/* 消息提示 */}
      {message && (
        <div style={{
          padding: '12px',
          marginBottom: '20px',
          backgroundColor: message.includes('成功') ? '#d4edda' : '#f8d7da',
          color: message.includes('成功') ? '#155724' : '#721c24',
          border: `1px solid ${message.includes('成功') ? '#c3e6cb' : '#f5c6cb'}`,
          borderRadius: '6px'
        }}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* ChatGPT账号 */}
        <div style={{ marginBottom: '25px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: '16px',
            color: '#333',
            textAlign: 'left'
          }}>
            填写你的ChatGPT的账号：
          </label>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            border: '2px solid #e0e0e0',
            borderRadius: '6px',
            backgroundColor: 'white'
          }}>
            <span style={{
              padding: '10px 15px',
              fontSize: '16px',
              color: '#6c757d'
            }}>✉</span>
            <input
              type="email"
              value={formData.chatgpt_account}
              onChange={(e) => setFormData(prev => ({...prev, chatgpt_account: e.target.value}))}
              placeholder="填写你的ChatGPT的账号："
              style={{
                flex: 1,
                padding: '12px 15px',
                fontSize: '16px',
                border: 'none',
                outline: 'none',
                backgroundColor: 'transparent',
                color: '#999'
              }}
            />
          </div>
        </div>

        {/* ChatGPT支付URL */}
        <div style={{ marginBottom: '25px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: '16px',
            color: '#333',
            textAlign: 'left'
          }}>
            填写你的ChatGPT支付端口URL:
          </label>
          <div style={{
            color: '#6c757d',
            fontSize: '14px',
            marginBottom: '8px',
            textAlign: 'left'
          }}>
            填写你的ChatGPT支付端口URL
          </div>
          <textarea
            value={formData.chatgpt_payment_url}
            onChange={(e) => setFormData(prev => ({...prev, chatgpt_payment_url: e.target.value}))}
            placeholder="登录ChatGPT账号购买Plus 支付页面链接&#10;https://pay.openai.com/c/pay/cs_live_a1Em0yetbv1wEunBgqpunNEIBy1bQI8LyPDe7BeQX7A5z5WN1xw8vB4pAl#fidpamzKaWAnPyd%2FbScp3ZwZ3Zmd2x1cWxqaTBrbHRwYGtqdnZAa2RhaWBnJz9jZGI2YCknZHVsTnB8Jz8nd3WEaaWyqeFgwM1k2KdfzJ3BtNNGhQQepsf4NelJDGlYB1o138gvXVA2XbNIxZGWi%2FnFGQaXtdKgVgVoOjP8PvVtgIJhO..."
            rows={6}
            style={{
              width: '100%',
              padding: '12px 15px',
              fontSize: '14px',
              border: '2px solid #e0e0e0',
              borderRadius: '6px',
              backgroundColor: 'white',
              resize: 'vertical',
              fontFamily: 'inherit',
              outline: 'none',
              color: '#333'
            }}
          />
        </div>

        {/* Claude邮箱 */}
        <div style={{ marginBottom: '25px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: '16px',
            color: '#333',
            textAlign: 'left'
          }}>
            购买claude code 请填写你的邮箱QQ/Googel/微信
          </label>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            border: '2px solid #e0e0e0',
            borderRadius: '6px',
            backgroundColor: 'white'
          }}>
            <span style={{
              padding: '10px 15px',
              fontSize: '16px',
              color: '#6c757d'
            }}>✉</span>
            <input
              type="text"
              value={formData.claude_email}
              onChange={(e) => setFormData(prev => ({...prev, claude_email: e.target.value}))}
              placeholder="购买claude code 请填写你的邮箱QQ/Googel/微信"
              style={{
                flex: 1,
                padding: '12px 15px',
                fontSize: '16px',
                border: 'none',
                outline: 'none',
                backgroundColor: 'transparent',
                color: '#999'
              }}
            />
          </div>
        </div>

        {/* 服务类型 */}
        <div style={{ marginBottom: '30px' }}>
          <div style={{
            fontSize: '16px',
            color: '#6c757d',
            fontStyle: 'italic',
            marginBottom: '8px',
            textAlign: 'left'
          }}>
            Type your question here
          </div>
          <label style={{
            display: 'block',
            marginBottom: '15px',
            fontSize: '16px',
            color: '#333',
            textAlign: 'left'
          }}>
            你购买的服务是：
          </label>

          <div style={{
            border: '2px solid #007bff',
            borderRadius: '8px',
            padding: '20px',
            backgroundColor: 'white'
          }}>
            {serviceOptions.map((option, index) => (
              <label
                key={option}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: index === serviceOptions.length - 1 ? '0' : '15px',
                  cursor: 'pointer'
                }}
              >
                <input
                  type="radio"
                  name="service_type"
                  value={option}
                  checked={formData.service_type === option}
                  onChange={(e) => setFormData(prev => ({...prev, service_type: e.target.value}))}
                  style={{
                    width: '18px',
                    height: '18px',
                    marginRight: '12px',
                    cursor: 'pointer',
                    accentColor: '#007bff'
                  }}
                />
                <span style={{
                  fontSize: '16px',
                  color: '#333',
                  lineHeight: '1.4'
                }}>
                  {option}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* 提交按钮 */}
        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            backgroundColor: isSubmitting ? '#6c757d' : '#ffc107',
            color: '#000',
            padding: '12px 24px',
            fontSize: '16px',
            fontWeight: 'bold',
            border: 'none',
            borderRadius: '6px',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s'
          }}
        >
          {isSubmitting ? '提交中...' : '提交'}
        </button>
      </form>
    </div>
  )
}