import { ApolloError, gql, useMutation, useQuery } from '@apollo/client'
import { EVALUATION_FIELDS_FRAGMENT, PARTICIPANT_FIELDS_FRAGMENT } from '../../../api/fragments'
import { Evaluation } from '../../../api/models'

interface EvaluationQueryProps {
    loading: boolean
    evaluations: Evaluation[] | undefined
    error: ApolloError | undefined
}

export const useEvaluationsQuery = (projectId: string, azureUniqueId: string): EvaluationQueryProps => {
    const GET_EVALUATIONS = gql`
        query($projectId: String!, $azureUniqueId: String!) {
            evaluations(
                where: {
                    and: [{ project: { id: { eq: $projectId } } }, { participants: { some: { azureUniqueId: { eq: $azureUniqueId } } } }]
                }
            ) {
                ...EvaluationFields
                participants {
                    ...ParticipantFields
                }
            }
        }
        ${EVALUATION_FIELDS_FRAGMENT}
        ${PARTICIPANT_FIELDS_FRAGMENT}
    `

    const { loading, data, error } = useQuery<{ evaluations: Evaluation[] }>(GET_EVALUATIONS, { variables: { projectId, azureUniqueId } })

    return {
        loading,
        evaluations: data?.evaluations,
        error,
    }
}

interface CreateEvaluationMutationProps {
    createEvaluation: (name: string, projectId: string) => void
    loading: boolean
    evaluation: Evaluation | undefined
    error: ApolloError | undefined
}

export const useCreateEvaluationMutation = (): CreateEvaluationMutationProps => {
    const ADD_EVALUATION = gql`
        mutation CreateEvaluation($name: String!, $projectId: String!) {
            createEvaluation(name: $name, projectId: $projectId) {
                ...EvaluationFields
            }
        }
        ${EVALUATION_FIELDS_FRAGMENT}
    `

    const [createEvaluationApolloFunc, { loading, data, error }] = useMutation(ADD_EVALUATION, {
        update(cache, { data: { createEvaluation } }) {
            cache.modify({
                fields: {
                    evaluations(existingEvaluations = []) {
                        const newEvaluationRef = cache.writeFragment({
                            data: createEvaluation,
                            fragment: EVALUATION_FIELDS_FRAGMENT,
                        })
                        return [...existingEvaluations, newEvaluationRef]
                    },
                },
            })
        },
    })

    const createEvaluation = (name: string, projectId: string) => {
        createEvaluationApolloFunc({ variables: { name, projectId } })
    }

    return {
        createEvaluation,
        loading,
        evaluation: data?.createEvaluation,
        error,
    }
}
