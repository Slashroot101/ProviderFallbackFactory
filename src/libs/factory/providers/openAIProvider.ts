import { ICompletionContext, ICompletionResult, IProvider } from "../../types";
import { ModelProviderFactory } from "..";

export default class OpenAIProvider implements IProvider {
    constructor(){

    }
    async getCompletion(ICompletionContext: ICompletionContext): Promise<ICompletionResult> {
        const modelProvider = new ModelProviderFactory().create(ICompletionContext.modelName);
        const completionResult = await modelProvider.getCompletion(ICompletionContext);
        return completionResult;
    }
}