export type QuizQuestion = {
  id: string
  type: string
  title: string
  text: string
  question: string
  answers: string[]
  feedback: string[]
  value: number | null
  fullfilled: boolean | null
  enabled: boolean | null
  nonEnabledMessage: string | null
}

export type QuizSectionContent = {
  meta: {
    id: string
    title: string
  }
  content: QuizQuestion[]
}
