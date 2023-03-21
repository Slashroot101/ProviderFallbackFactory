import Axios from "axios";
import { ConversationalCompletionItem, ICompletionContext, ICompletionResult, IModelProvider, IOpenAIChoice, IPromptProcessor, ModelEnum, OpenAIChatCompletionResponse, OpenAIConversationRole } from "../../../types";


export class GPT4Provider implements IModelProvider {
    public modelName: ModelEnum = ModelEnum.GPT4;
    public promptProcessor: IPromptProcessor; 

    withPromptProcessor(promptProcessor: IPromptProcessor){
        this.promptProcessor = promptProcessor;
        return this;
    }

    public async getCompletion(completionContext: ICompletionContext): Promise<ICompletionResult>{
        const prompt = this.promptProcessor.process(completionContext.userInput, completionContext.skill);
        const {data} = await Axios.post(`https://api.openai.com/v1/chat/completions`, {messages: prompt, model: this.modelName, max_tokens: 100, temperature: 0.9, top_p: 1, frequency_penalty: 0, presence_penalty: 0, }, {headers: {Authorization: `Bearer ${process.env.OPEN_AI_AUTH_TOKEN}`}},);
        return {id: data.id, completion: data.choices.map((x: IOpenAIChoice) => x.message)}
    }

}