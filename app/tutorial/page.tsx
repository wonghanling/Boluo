"use client"

import React from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight } from "lucide-react"

export default function TutorialPage() {
  const [currentStep, setCurrentStep] = React.useState(1)
  const totalSteps = 11

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const goToStep = (step: number) => {
    setCurrentStep(step)
  }

  return (
    <div className="min-h-screen bg-yellow-300">
      <div className="container mx-auto px-4 py-8">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-blue-800 mb-4">
            ChatGPT Plus 代充图文教程
          </h1>
          <p className="text-lg text-blue-700">
            按照以下步骤完成 ChatGPT Plus 代充服务
          </p>
        </div>

        {/* 步骤导航 */}
        <div className="flex justify-center mb-6">
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
              <button
                key={step}
                onClick={() => goToStep(step)}
                className={`w-10 h-10 rounded-full text-sm font-medium transition-colors ${
                  currentStep === step
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-blue-600 hover:bg-blue-100'
                }`}
              >
                {step}
              </button>
            ))}
          </div>
        </div>

        {/* 当前步骤显示 */}
        <div className="text-center mb-4">
          <span className="text-blue-800 text-lg font-medium">
            步骤 {currentStep} / {totalSteps}
          </span>
        </div>

        {/* 图片展示区域 */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-xl">
            <div className="relative w-full h-auto">
              <Image
                src={`/${currentStep}.jpg`}
                alt={`教程步骤 ${currentStep}`}
                width={1000}
                height={600}
                className="w-full h-auto rounded-lg"
                priority={currentStep <= 3}
              />
            </div>
          </div>
        </div>

        {/* 导航按钮 */}
        <div className="flex justify-center gap-4 mb-8">
          <Button
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4" />
            上一步
          </Button>

          <Button
            onClick={nextStep}
            disabled={currentStep === totalSteps}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            下一步
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {/* 返回按钮 */}
        <div className="text-center">
          <Button
            onClick={() => window.history.back()}
            variant="outline"
            className="border-blue-600 text-blue-600 hover:bg-blue-50"
          >
            返回上一页
          </Button>
        </div>
      </div>
    </div>
  )
}