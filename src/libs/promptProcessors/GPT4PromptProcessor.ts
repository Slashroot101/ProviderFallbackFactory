import { ConversationalCompletionItem, IPromptProcessor, OpenAIConversationRole, Skill, UserParameters } from "../types";

export class GPT4PromptProcessor implements IPromptProcessor {
    process(userInput: UserParameters, skill: Skill): ConversationalCompletionItem[]{
        let ret: ConversationalCompletionItem[] = []
        let words = ''
        if (skill.templatePrefix) {
            ret.push({ role: OpenAIConversationRole.SYSTEM, content: skill.templatePrefix })
        }

        for (const item of skill.template) {
            const itemValue = { role: item.role as OpenAIConversationRole, content: item.content }
            //no strings to template from
            if (!item.stringTemplate) {
            ret.push(itemValue)
            continue
            }
            const newlineCharacter = '\n'
            //strings to template from
            for (const stringTemplate of item.stringTemplate) {
            const { label = '', id: value, newlines = 0, static: staticValue = null } = stringTemplate
            if (staticValue || userInput[value]) {
                itemValue.content =
                itemValue.content.replace(
                    `<jasper>{${value}}</jasper>`,
                    `${label}${staticValue ? staticValue : userInput[value]}`
                ) + newlineCharacter.repeat(newlines)
            } else {
                itemValue.content = itemValue.content.replace(`<jasper>{${value}}</jasper>`, ``).trim()
            }
            words += userInput[value] || ''
            }

            ret.push(itemValue)
        }

        if (userInput?.conversation?.length) {
            const userConversation = userInput.conversation.map((item) => {
            return {
                role: item.author === 'USER' ? OpenAIConversationRole.USER : item.author === 'JASPER' ? OpenAIConversationRole.ASSISTANT : item.author as OpenAIConversationRole,
                content: item.message,
            }
            })
            ret.push(...userConversation)
        }

        if (userInput?.message) {
            ret.push({ role: OpenAIConversationRole.USER, content: userInput.message })
        }

        if (userInput?.lastCommand) {
            ret.push({ role: OpenAIConversationRole.SYSTEM, content: userInput.lastCommand })
        }

        let lastItem = ret[ret.length - 1]
        if (userInput?.toLanguage && lastItem?.role === 'user') {
            ret[ret.length - 1] = { ...lastItem, content: lastItem.content + ` Output Language Code: ${userInput?.toLanguage}` }
        }

        return ret;       
    }
}