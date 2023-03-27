import { ICompletionContext, ICompletionResult, IConversationalCompletionChunk, IProvider } from "../../types";
import { ModelProviderFactory } from "..";

export default class AnthropicProvider implements IProvider {
    constructor(){

    }
    async streamCompletion(ICompletionContext: ICompletionContext): Promise<AsyncGenerator<IConversationalCompletionChunk, void, unknown>> {
        const modelProvider = new ModelProviderFactory().create(ICompletionContext.modelName);
        return await modelProvider.streamCompletion(ICompletionContext);
    }
    async getCompletion(ICompletionContext: ICompletionContext): Promise<ICompletionResult> {
        const modelProvider = new ModelProviderFactory().create(ICompletionContext.modelName);
        const completionResult = await modelProvider.getCompletion(ICompletionContext);
        return completionResult;
    }
}