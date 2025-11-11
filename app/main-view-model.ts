import { Observable, EventData, Page } from '@nativescript/core';

export class MainViewModel extends Observable {
    constructor() {
        super();
    }
}

export function navigatingTo(args: EventData) {
    const page = <Page>args.object;
    page.bindingContext = new MainViewModel();
}

export function onDoctorBookingTap(args: EventData) {
    const page = (<any>args.object).page;
    page.frame.navigate('pages/doctor-booking/doctor-booking-page');
}

export function onStepCounterTap(args: EventData) {
    const page = (<any>args.object).page;
    page.frame.navigate('pages/step-counter/step-counter-page');
}

export function onAIChatTap(args: EventData) {
    const page = (<any>args.object).page;
    page.frame.navigate('pages/ai-chat/ai-chat-page');
}