"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Rocket, 
  ShoppingCart, 
  Briefcase, 
  Code,
  ArrowRight,
  CheckCircle2,
  Loader2
} from "lucide-react"

interface Template {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  category: string
  features: string[]
  businessType: string
  defaultTeamSize: number
  defaultStage: 'idea' | 'mvp' | 'scaling'
}

const templates: Template[] = [
  {
    id: 'saas-launch',
    name: 'SaaS Launch System',
    description: 'Complete operational framework for launching and scaling a SaaS product',
    icon: <Rocket className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
    category: 'Software',
    features: [
      'Product development workflow',
      'Customer onboarding process',
      'Support ticket system',
      'Revenue tracking metrics'
    ],
    businessType: 'SaaS',
    defaultTeamSize: 5,
    defaultStage: 'mvp'
  },
  {
    id: 'ecommerce',
    name: 'E-commerce Operations',
    description: 'End-to-end system for managing online store operations',
    icon: <ShoppingCart className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
    category: 'Retail',
    features: [
      'Order fulfillment workflow',
      'Inventory management',
      'Customer service process',
      'Marketing automation'
    ],
    businessType: 'E-commerce',
    defaultTeamSize: 8,
    defaultStage: 'scaling'
  },
  {
    id: 'agency',
    name: 'Agency Workflow',
    description: 'Streamlined system for managing client projects and deliverables',
    icon: <Briefcase className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
    category: 'Services',
    features: [
      'Client onboarding process',
      'Project management workflow',
      'Quality assurance system',
      'Billing and invoicing'
    ],
    businessType: 'Agency',
    defaultTeamSize: 10,
    defaultStage: 'scaling'
  },
  {
    id: 'product-dev',
    name: 'Product Development Pipeline',
    description: 'Systematic approach to product development from ideation to launch',
    icon: <Code className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
    category: 'Product',
    features: [
      'Ideation and validation',
      'Development sprints',
      'Testing and QA process',
      'Launch and iteration'
    ],
    businessType: 'Product Development',
    defaultTeamSize: 6,
    defaultStage: 'idea'
  }
]

interface SystemTemplatesProps {
  onSelectTemplate: (data: {
    type: string
    teamSize: number
    stage: 'idea' | 'mvp' | 'scaling'
    templateName?: string
    templateId?: string
  }) => void
  isGenerating?: boolean
  generatingTemplateId?: string | null
}

export default function SystemTemplates({ onSelectTemplate, isGenerating = false, generatingTemplateId = null }: SystemTemplatesProps) {
  const handleTemplateSelect = (template: Template) => {
    // Call immediately without delay, including template name and ID
    onSelectTemplate({
      type: template.businessType,
      teamSize: template.defaultTeamSize,
      stage: template.defaultStage,
      templateName: template.name,
      templateId: template.id
    })
  }

  const handleButtonClick = (e: React.MouseEvent, template: Template) => {
    e.preventDefault()
    e.stopPropagation()
    // Call handler immediately - loading state is controlled by parent
    handleTemplateSelect(template)
  }

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h2 className="text-xl font-medium text-gray-900 dark:text-white">
          System Templates Library
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Choose from pre-built operational systems or customize them to fit your needs
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {templates.map((template) => (
          <div
            key={template.id}
            className="bg-white dark:bg-slate-950 border border-gray-200/60 dark:border-gray-800/60 rounded-lg p-4 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.2)] hover:shadow-[0_2px_6px_0_rgba(0,0,0,0.08)] dark:hover:shadow-[0_2px_6px_0_rgba(0,0,0,0.3)] transition-all cursor-pointer group"
            onClick={(e) => {
              if (generatingTemplateId !== template.id && !isGenerating) {
                handleTemplateSelect(template)
              }
            }}
          >
            <div className="flex items-start gap-2.5 mb-3">
              <div className="mt-0.5">
                {template.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-medium text-gray-900 dark:text-white mb-1.5 leading-tight">
                  {template.name}
                </h3>
                <Badge variant="outline" className="text-xs py-0 px-1.5 h-5">
                  {template.category}
                </Badge>
              </div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2 leading-relaxed">
              {template.description}
            </p>
            <div className="space-y-1.5 mb-3">
              {template.features.slice(0, 3).map((feature, index) => (
                <div key={index} className="flex items-start gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                  <CheckCircle2 className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 flex-shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{feature}</span>
                </div>
              ))}
            </div>
            <Button 
              variant="outline"
              size="sm"
              className="w-full border-gray-200/60 dark:border-gray-800/60 h-9 text-sm"
              onClick={(e) => handleButtonClick(e, template)}
              disabled={isGenerating && generatingTemplateId === template.id}
            >
              {isGenerating && generatingTemplateId === template.id ? (
                <>
                  <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  Use Template
                  <ArrowRight className="w-3 h-3 ml-1.5" />
                </>
              )}
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}

