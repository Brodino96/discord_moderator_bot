import type { BotModule } from "../modules/bot"

// Only ChatGPT | Michigan TypeScript could defeat this shit 
export type DeepReadonly<T> = {
    readonly [K in keyof T]: T[K] extends (...args: any[]) => any
      ? T[K] // If it's a function, keep it as is
      : T[K] extends object
      ? DeepReadonly<T[K]> // If it's an object or array, recurse
      : T[K] // Otherwise, keep the property as is
}

export type MethodOf<T> = {
	[K in keyof T]: T[K] extends (...args: any[]) => any ? K : never;
}[keyof T]

export type BotModuleMethod = MethodOf<BotModule>