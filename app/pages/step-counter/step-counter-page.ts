import { EventData, Page } from "@nativescript/core";
import { StepCounterViewModel } from "./step-counter-view-model";

let viewModel: StepCounterViewModel;

export function navigatingTo(args: EventData) {
    const page = <Page>args.object;
    viewModel = new StepCounterViewModel();
    page.bindingContext = viewModel;
}

export function onStartTracking(args: EventData) {
    viewModel.startTracking();
}

export function onStopTracking(args: EventData) {
    viewModel.stopTracking();
}

export function onResetSteps(args: EventData) {
    viewModel.resetSteps();
}

export function onBackTap(args: EventData) {
    const page = (<any>args.object).page;
    viewModel.stopTracking();
    page.frame.goBack();
}
