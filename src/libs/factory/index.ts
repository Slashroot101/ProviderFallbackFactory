import { GPT4PromptProcessor } from "../promptProcessors/GPT4PromptProcessor";
import { IModelProvider, IModelProviderFactory, IProvider, IProviderFactory, ModelEnum, ProviderEnum } from "../types";
import { ClaudeV1Provider } from "./modelProviders/providers/ClaudeV1Provider";
import { GPT4Provider } from "./modelProviders/providers/GPT4Provider";
import AnthropicProvider from "./providers/anthropicProvider";
import OpenAIProvider from "./providers/openAIProvider";

export class ProviderFactory implements IProviderFactory {
    public create(providerName: string): IProvider {
        switch(providerName) {
            case ProviderEnum.OPENAI:
                return new OpenAIProvider();
            case ProviderEnum.ANTHROPIC:
                return new AnthropicProvider();
            default:
                throw new Error(`Provider ${providerName} not valid or registered provider`);
        }
    }
}

export class ModelProviderFactory implements IModelProviderFactory{
    public create(modelName: string): IModelProvider {
        switch(modelName) {
            case ModelEnum.GPT4:
                return new GPT4Provider().withPromptProcessor(new GPT4PromptProcessor());
            case ModelEnum.CLAUDEV1:
                return new ClaudeV1Provider().withPromptProcessor(new GPT4PromptProcessor());
            default:
                throw new Error(`Model ${modelName} not valid or registered model`);
        }
    }
}