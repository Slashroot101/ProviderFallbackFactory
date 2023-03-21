export interface IProviderFactory {
    create: (providerName: string) => IProvider;
}

export interface IModelProviderFactory {
    create: (modelName: string) => IModelProvider;
}

export interface IPromptProcessor {
    process: (userInput: UserParameters, skill: Skill) => ConversationalCompletionItem[];
}

export type Skill = {
    template: TemplateItem[];
    templatePrefix: string;
}

interface IObjectKeys {
    [key: string]: string | number | undefined | JasperConversationItem[];
  }

export interface UserParameters extends IObjectKeys {
    conversation?: JasperConversationItem[];
    message?: string;
    lastCommand?: string;
    toLanguage?: string;

}

export type JasperConversationItem = {
    author: JasperRoleEnum,
    message: string,
}

export enum ProviderEnum {
    OPENAI = 'openai',
    ANTHROPIC = 'anthropic',
}

export enum JasperRoleEnum {
    JASPER = 'JASPER',
    USER = 'USER',
}

export interface IModelProvider {
    modelName: ModelEnum;
    getCompletion: (ICompletionContext: ICompletionContext) => Promise<ICompletionResult>;
    withPromptProcessor: (promptProcessor: IPromptProcessor) => IModelProvider;
    promptProcessor: IPromptProcessor;
}

export type TemplateItem = {
    role: string;
    content: string;
    stringTemplate?: StringTemplateItem[];
}

export type StringTemplateItem = {
    id: string;
    label: string;
    newlines: number;
    static?: string;
}

export enum ModelEnum {
    GPT4 = 'gpt-4',
}

export interface IProvider {
    getCompletion: (ICompletionContext: ICompletionContext) => Promise<ICompletionResult>;
}

export type OpenAIChatCompletionResponse = {
    id: string;
    object: string;
    created: number;
    model: string;
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;   
    },
    choices: IOpenAIChoice[]
}

export interface IOpenAIChoice {
    message: {
        role: OpenAIConversationRole,
        content: string,
    },
    finish_reason: string;
    index: number;
}

export interface ICompletionContext {
    modelName: string;
    skill: Skill;
    userInput: UserParameters;
}

export interface ICompletionResult {
    id: string; 
    completion: ConversationalCompletionItem[];
}

export type ConversationalCompletionItem = {
    content: string;
    role: OpenAIConversationRole;
}

export enum OpenAIConversationRole {
    ASSISTANT = 'assistant',
    SYSTEM = 'system',
    USER = 'user'
}

