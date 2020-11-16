import { ApolloError, gql, useMutation } from '@apollo/client'
import { EVALUATION_FIELDS_FRAGMENT } from '../api/fragments'
import { Evaluation } from '../api/models'

interface ProgressEvaluationMutationProps {
    progressEvaluation: (evaluationId: string) => void
    loading: boolean
    evaluation: Evaluation | undefined
    error: ApolloError | undefined
}

export const useProgressEvaluationMutation = (): ProgressEvaluationMutationProps => {
    const PROGRESS_EVALUATION = gql`
        mutation ProgessEvaluation($evaluationId: String!) {
            progressEvaluation(evaluationId: $evaluationId){
                ...Fields
            }
        }
        ${EVALUATION_FIELDS_FRAGMENT}
    `

    const [progressEvaluationApolloFunc, { loading, data, error }] = useMutation(
        PROGRESS_EVALUATION, {
            update(cache, { data: { progressEvaluation } }) {
                cache.modify({
                    fields: {
                        evaluations(existingEvaluations = []) {
                            const newEvaluationRef = cache.writeFragment({
                                id: progressEvaluation.id,
                                data: progressEvaluation,
                                fragment: EVALUATION_FIELDS_FRAGMENT
                            })
                            return [...existingEvaluations, newEvaluationRef]
                        }
                    }
                })
            }
        }
    )

    const progressEvaluation = (evaluationId: string) => {
        progressEvaluationApolloFunc({ variables: { evaluationId } })
    }

    return {
        progressEvaluation: progressEvaluation,
        loading,
        evaluation: data?.progressEvaluation,
        error
    }
}