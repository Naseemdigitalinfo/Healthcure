import { EventData, Page } from '@nativescript/core';
import { AIChatViewModel } from './ai-chat-view-model';

let viewModel: AIChatViewModel;

export function navigatingTo(args: EventData) {
    const page = <Page>args.object;
    viewModel = new AIChatViewModel();
    page.bindingContext = viewModel;
}

export function onBackTap(args: EventData) {
    const page = (<any>args.object).page;
    page.frame.goBack();
}

export function onSendMessage(args: EventData) {
    viewModel.sendMessage();
}

export function onClearChat(args: EventData) {
    viewModel.clearChat();
}