"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Rocket, 
  ShoppingCart, 
  Briefcase, 
  Code,
  ArrowRight,
  CheckCircle2
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
    icon: <Rocket className="w-6 h-6" />,
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
    icon: <ShoppingCart className="w-6 h-6" />,
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
    icon: <Briefcase className="w-6 h-6" />,
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
    icon: <Code className="w-6 h-6" />,
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
  }) => void
}

export default function SystemTemplates({ onSelectTemplate }: SystemTemplatesProps) {
  const handleTemplateSelect = (template: Template) => {
    onSelectTemplate({
      type: template.businessType,
      teamSize: template.defaultTeamSize,
      stage: template.defaultStage
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          System Templates Library
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Choose from pre-built operational systems or customize them to fit your needs
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {templates.map((template) => (
          <Card 
            key={template.id} 
            className="hover:shadow-lg transition-shadow cursor-pointer group"
            onClick={() => handleTemplateSelect(template)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#39d2c0]/10 rounded-lg text-[#39d2c0]">
                    {template.icon}
                  </div>
                  <div>
                    <CardTitle className="group-hover:text-[#39d2c0] transition-colors">
                      {template.name}
                    </CardTitle>
                    <Badge variant="outline" className="mt-2">
                      {template.category}
                    </Badge>
                  </div>
                </div>
              </div>
              <CardDescription className="mt-3">
                {template.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Key Features:
                  </h4>
                  <ul className="space-y-1">
                    {template.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <CheckCircle2 className="w-4 h-4 text-[#39d2c0] flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <Button 
                  className="w-full mt-4 bg-[#39d2c0] hover:bg-[#2bb3a3]"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleTemplateSelect(template)
                  }}
                >
                  Use This Template
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

