import { IModelProviderFactory, ModelEnum, IModelProvider } from "../../types";
import { GPT4Provider } from "./providers/GPT4Provider";

export class ModelProviderFactory implements IModelProviderFactory {
    public create(modelName: string): IModelProvider {
        switch(modelName) {
            case ModelEnum.GPT4:
                return new GPT4Provider();
            default:
                throw new Error(`Model ${modelName} not valid or registered model`);
        }
    }
}