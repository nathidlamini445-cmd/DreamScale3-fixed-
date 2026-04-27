import { Button } from "@/components/ui/button"
import { Plus, FolderOpen, ArrowRight } from "lucide-react"

export function ProjectsPanel() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-black">{"Projects"}</h2>
        <Button size="icon" variant="ghost" className="hover:bg-primary/10 hover:text-primary">
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>

      <div className="p-6 text-center bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
        <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
          <FolderOpen className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">{"No project yet"}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          {"Create your first project to get started with your creative journey"}
        </p>
        <Button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          {"Create Project"}
        </Button>
      </div>

    </div>
  )
}
