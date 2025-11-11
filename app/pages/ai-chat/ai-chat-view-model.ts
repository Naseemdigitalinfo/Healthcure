import { Observable, ObservableArray, ApplicationSettings, alert } from '@nativescript/core';
import { Http } from '@nativescript/core';

interface ChatMessage {
    text: string;
    isUser: boolean;
    time: string;
}

export class AIChatViewModel extends Observable {
    private _messages: ObservableArray<ChatMessage>;
    private _messageInput: string = '';
    private _isLoading: boolean = false;
    private _isEmpty: boolean = true;
    private _apiKey: string = ''; // 

    constructor() {
        super();
        this._messages = new ObservableArray<ChatMessage>();
        this.loadChatHistory();
    }

    get messages(): ObservableArray<ChatMessage> {
        return this._messages;
    }

    get messageInput(): string {
        return this._messageInput;
    }

    set messageInput(value: string) {
        if (this._messageInput !== value) {
            this._messageInput = value;
            this.notifyPropertyChange('messageInput', value);
        }
    }

    get isLoading(): boolean {
        return this._isLoading;
    }

    get isEmpty(): boolean {
        return this._isEmpty;
    }

    async sendMessage(): Promise<void> {
        try {
            const userMessage = this._messageInput.trim();

            if (!userMessage) {
                return;
            }

            // Check if API key is set
            if (!this._apiKey) {
                await alert({
                    title: "API Key Required",
                    message: "Please add your OpenAI API key in the code (ai-chat-view-model.ts, line 15). Get your API key from https://platform.openai.com/api-keys",
                    okButtonText: "OK"
                });
                return;
            }

            // Add user message
            const userMsg: ChatMessage = {
                text: userMessage,
                isUser: true,
                time: this.getCurrentTime()
            };

            this._messages.push(userMsg);
            this._isEmpty = false;
            this.notifyPropertyChange('isEmpty', this._isEmpty);

            // Clear input
            this.messageInput = '';

            // Show loading
            this._isLoading = true;
            this.notifyPropertyChange('isLoading', this._isLoading);

            // Call OpenAI API
            const aiResponse = await this.callOpenAI(userMessage);

            // Add AI response
            const aiMsg: ChatMessage = {
                text: aiResponse,
                isUser: false,
                time: this.getCurrentTime()
            };

            this._messages.push(aiMsg);

            // Save chat history
            this.saveChatHistory();

        } catch (error) {
            console.error('Error sending message:', error);

            const errorMsg: ChatMessage = {
                text: 'Sorry, I encountered an error. Please check your internet connection and API key, then try again.',
                isUser: false,
                time: this.getCurrentTime()
            };

            this._messages.push(errorMsg);

            await alert({
                title: "Error",
                message: "Failed to get AI response. Please check:\n1. Internet connection\n2. OpenAI API key is valid\n3. API key has credits",
                okButtonText: "OK"
            });
        } finally {
            this._isLoading = false;
            this.notifyPropertyChange('isLoading', this._isLoading);
        }
    }

    private async callOpenAI(userMessage: string): Promise<string> {
        try {
            const response = await Http.request({
                url: 'https://api.openai.com/v1/chat/completions',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this._apiKey}`
                },
                content: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are a helpful health assistant. Provide accurate health information and advice. Always remind users that your advice is not a substitute for professional medical care and they should consult healthcare providers for serious concerns. Be empathetic, clear, and concise.'
                        },
                        {
                            role: 'user',
                            content: userMessage
                        }
                    ],
                    max_tokens: 500,
                    temperature: 0.7
                }),
                timeout: 30000
            });

            if (response.statusCode === 200) {
                const result = response.content.toJSON();

                if (result.choices && result.choices.length > 0) {
                    return result.choices[0].message.content.trim();
                } else {
                    throw new Error('Invalid response format from OpenAI');
                }
            } else if (response.statusCode === 401) {
                throw new Error('Invalid API key. Please check your OpenAI API key.');
            } else if (response.statusCode === 429) {
                throw new Error('Rate limit exceeded. Please wait a moment and try again.');
            } else {
                throw new Error(`API error: ${response.statusCode}`);
            }
        } catch (error) {
            console.error('OpenAI API error:', error);
            throw error;
        }
    }

    clearChat(): void {
        try {
            this._messages.splice(0, this._messages.length);
            this._isEmpty = true;
            this.notifyPropertyChange('isEmpty', this._isEmpty);
            ApplicationSettings.remove('chatHistory');
        } catch (error) {
            console.error('Error clearing chat:', error);
        }
    }

    private loadChatHistory(): void {
        try {
            const historyStr = ApplicationSettings.getString('chatHistory', '[]');
            const history = JSON.parse(historyStr);

            if (history && history.length > 0) {
                history.forEach((msg: ChatMessage) => {
                    this._messages.push(msg);
                });
                this._isEmpty = false;
                this.notifyPropertyChange('isEmpty', this._isEmpty);
            }
        } catch (error) {
            console.error('Error loading chat history:', error);
        }
    }

    private saveChatHistory(): void {
        try {
            const history = this._messages.map(msg => ({
                text: msg.text,
                isUser: msg.isUser,
                time: msg.time
            }));

            ApplicationSettings.setString('chatHistory', JSON.stringify(history));
        } catch (error) {
            console.error('Error saving chat history:', error);
        }
    }

    private getCurrentTime(): string {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    }
}