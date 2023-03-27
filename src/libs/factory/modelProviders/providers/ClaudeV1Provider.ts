import Axios from "axios";
import { streamToAsyncGenerator } from "../../../streamToAsyncGenerator";
import { AnthropicCompletionChunk, ICompletionContext, ICompletionResult, IConversationalCompletionChunk, IModelProvider, IPromptProcessor, ModelEnum, OpenAiCompletionChunk, OpenAIConversationRole } from "../../../types";

export class ClaudeV1Provider implements IModelProvider {
    public modelName: ModelEnum = ModelEnum.CLAUDEV1;
    public promptProcessor: IPromptProcessor; 

    withPromptProcessor(promptProcessor: IPromptProcessor){
        this.promptProcessor = promptProcessor;
        return this;
    }

    public async *streamCompletion (completionContext: ICompletionContext): AsyncGenerator<IConversationalCompletionChunk, void, unknown>{
        const prompt = this.promptProcessor.process(completionContext.userInput, completionContext.skill);
        const stream = await Axios.post(`https://api.anthropic.com/v1/complete`, {prompt: prompt.map(x => `${x.role}: ${x.content}`).join('\n'), model: this.modelName, max_tokens_to_sample: 100, stream: true }, {headers: {'X-API-Key': `${process.env.ANTHROPIC_AUTH_TOKEN}`}, responseType: 'stream'},);

        for await (const chunk of await streamToAsyncGenerator<Buffer>(stream.data, 1000)) {
            const decodedBuffer = chunk.toString();
            const parsedChunk = decodedBuffer.includes('[DONE]') ? null : JSON.parse(decodedBuffer.substring(6)) as AnthropicCompletionChunk;
            if(parsedChunk !== null) {
                yield {content: parsedChunk.completion, role: OpenAIConversationRole.ASSISTANT, id: parsedChunk.log_id} as IConversationalCompletionChunk;
            }
        }
    }

    public async getCompletion(completionContext: ICompletionContext): Promise<ICompletionResult>{
        const prompt = this.promptProcessor.process(completionContext.userInput, completionContext.skill);
        const {data} = await Axios.post(`https://api.anthropic.com/v1/complete`, {prompt: prompt.map(x => `${x.role}: ${x.content}`).join('\n'), model: this.modelName, max_tokens_to_sample: 100, }, {headers: {'X-API-Key': `${process.env.ANTHROPIC_AUTH_TOKEN}`}},);
        return {id: data.id, completion: data.completion}
    }

}