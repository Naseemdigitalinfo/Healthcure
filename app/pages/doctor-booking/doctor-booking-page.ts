import { EventData, Page, alert } from '@nativescript/core';
import { DoctorBookingViewModel } from './doctor-booking-view-model';

let viewModel: DoctorBookingViewModel;

export function navigatingTo(args: EventData) {
    const page = <Page>args.object;
    viewModel = new DoctorBookingViewModel();
    page.bindingContext = viewModel;
}

export function onBackTap(args: EventData) {
    const page = (<any>args.object).page;
    page.frame.goBack();
}


export function onDoctorSelected(args: any) {
    const picker = args.object;
    const selectedIndex = picker.selectedIndex ?? 0;
    console.log("Doctor picker changed. Index:", selectedIndex);
    viewModel.selectDoctor(selectedIndex);
}


export function onSpecialtySelected(args: any) {
    const selectedIndex = args.newIndex;
    viewModel.selectSpecialty(selectedIndex);
}

export function onDateTap(args: EventData) {
    viewModel.showDatePicker();
}

export function onTimeTap(args: EventData) {
    viewModel.showTimePicker();
}

export function onBookAppointment(args: EventData) {
    const result = viewModel.bookAppointment();

    if (result.success) {
        alert({
            title: "✅ Booking Successful!",
            message: result.message,
            okButtonText: "Great!"
        }).then(() => {
            const page = (<any>args.object).page;
            page.frame.goBack();
        });
    } else {
        alert({
            title: "❌ Booking Failed",
            message: result.message,
            okButtonText: "OK"
        });
    }
}