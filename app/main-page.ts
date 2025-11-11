import { EventData, Page, Frame } from '@nativescript/core';
import { MainViewModel } from './main-view-model';

export function navigatingTo(args: EventData) {
  const page = <Page>args.object;
  page.bindingContext = new MainViewModel();
}

// 🏥 Doctor Booking Navigation
export function onDoctorBookingTap() {
  console.log("Navigating to doctor booking...");
  Frame.topmost().navigate({
    moduleName: "~/pages/doctor-booking/doctor-booking-page",
    clearHistory: false
  });
}

// 👟 Step Counter Navigation
export function onStepCounterTap() {
  console.log("Navigating to step counter...");
  Frame.topmost().navigate({
    moduleName: "~/pages/step-counter/step-counter-page",
    clearHistory: false
  });
}

// 🤖 AI Chat Navigation
export function onAIChatTap() {
  console.log("Navigating to AI Chat...");
  Frame.topmost().navigate({
    moduleName: "~/pages/ai-chat/ai-chat-page",
    clearHistory: false
  });
}
