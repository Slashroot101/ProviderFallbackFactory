import Axios from "axios";
import { streamToAsyncGenerator } from "../../../streamToAsyncGenerator";
import { ConversationalCompletionItem, ICompletionContext, ICompletionResult, IConversationalCompletionChunk, IModelProvider, IOpenAIChoice, IPromptProcessor, ModelEnum, OpenAIChatCompletionResponse, OpenAiCompletionChunk, OpenAIConversationRole } from "../../../types";


export class GPT4Provider implements IModelProvider {
    public modelName: ModelEnum = ModelEnum.GPT4;
    public promptProcessor: IPromptProcessor; 

    withPromptProcessor(promptProcessor: IPromptProcessor){
        this.promptProcessor = promptProcessor;
        return this;
    }

    public async *streamCompletion(completionContext: ICompletionContext): AsyncGenerator<IConversationalCompletionChunk, void, unknown>{
        const prompt = this.promptProcessor.process(completionContext.userInput, completionContext.skill);
        const stream = await Axios.post(`https://api.openai.com/v1/chat/completions`, {messages: prompt, model: this.modelName, max_tokens: 100, temperature: 0.9, top_p: 1, frequency_penalty: 0, presence_penalty: 0, stream: true }, {headers: {Authorization: `Bearer ${process.env.OPEN_AI_AUTH_TOKEN}`,}, responseType: 'stream'},);
        for await (const chunk of await streamToAsyncGenerator<Buffer>(stream.data, 1000)) {
            const decodedBuffer = chunk.toString();
            const parsedChunk = decodedBuffer.includes('[DONE]') ? null : JSON.parse(decodedBuffer.substring(6)) as OpenAiCompletionChunk;
            if(parsedChunk !== null) {
                const completionItem = {content: parsedChunk.choices[0].delta.content, role: OpenAIConversationRole.ASSISTANT, id: parsedChunk.id} as IConversationalCompletionChunk;
                yield completionItem;
            }
        }
    }
    public async getCompletion(completionContext: ICompletionContext): Promise<ICompletionResult>{
        const prompt = this.promptProcessor.process(completionContext.userInput, completionContext.skill);
        const {data} = await Axios.post(`https://api.openai.com/v1/chat/completions`, {messages: prompt, model: this.modelName, max_tokens: 100, temperature: 0.9, top_p: 1, frequency_penalty: 0, presence_penalty: 0, }, {headers: {Authorization: `Bearer ${process.env.OPEN_AI_AUTH_TOKEN}`}},);
        return {id: data.id, completion: data.choices.map((x: IOpenAIChoice) => x.message)}
    }

}