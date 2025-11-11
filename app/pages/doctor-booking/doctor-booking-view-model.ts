import { Observable, ApplicationSettings } from '@nativescript/core';
import * as dialogs from '@nativescript/core/ui/dialogs';

interface Doctor {
    name: string;
    specialty: string;
    experience: string;
    rating: string;
    icon: string;
}

export class DoctorBookingViewModel extends Observable {
    private _doctors: string[] = [
        'Dr. Sarah Johnson',
        'Dr. Michael Chen',
        'Dr. Emily Parker',
        'Dr. David Kumar',
        'Dr. Lisa Anderson'
    ];

    private _doctorsData: Doctor[] = [
        { name: 'Dr. Sarah Johnson', specialty: 'Cardiologist', experience: '15 years experience', rating: '4.8/5', icon: '👩‍⚕️' },
        { name: 'Dr. Michael Chen', specialty: 'Neurologist', experience: '12 years experience', rating: '4.9/5', icon: '👨‍⚕️' },
        { name: 'Dr. Emily Parker', specialty: 'Pediatrician', experience: '10 years experience', rating: '4.7/5', icon: '👩‍⚕️' },
        { name: 'Dr. David Kumar', specialty: 'Orthopedic', experience: '18 years experience', rating: '4.9/5', icon: '👨‍⚕️' },
        { name: 'Dr. Lisa Anderson', specialty: 'Dermatologist', experience: '8 years experience', rating: '4.6/5', icon: '👩‍⚕️' }
    ];

    private _specialties: string[] = [
        'General Consultation',
        'Cardiology',
        'Neurology',
        'Pediatrics',
        'Orthopedics',
        'Dermatology',
        'Dentistry',
        'Ophthalmology'
    ];

    private _selectedDoctorIndex: number = 0;
    private _selectedSpecialtyIndex: number = 0;
    private _selectedDoctor: Doctor | null = null;
    private _patientName: string = '';
    private _patientAge: string = '';
    private _patientPhone: string = '';
    private _selectedDate: string = 'Select Date';
    private _selectedTime: string = 'Select Time';
    private _isDoctorSelected: boolean = false;

    constructor() {
        super();
        this._selectedDoctor = this._doctorsData.length > 0 ? this._doctorsData[0] : null;
        this._isDoctorSelected = !!this._selectedDoctor;
    }

    get doctors(): string[] {
        return this._doctors;
    }

    get specialties(): string[] {
        return this._specialties;
    }

    get selectedDoctorIndex(): number {
        return this._selectedDoctorIndex;
    }

    set selectedDoctorIndex(value: number) {
        if (this._selectedDoctorIndex !== value) {
            this._selectedDoctorIndex = value;
            this.notifyPropertyChange('selectedDoctorIndex', value);
        }
    }

    get selectedSpecialtyIndex(): number {
        return this._selectedSpecialtyIndex;
    }

    set selectedSpecialtyIndex(value: number) {
        if (this._selectedSpecialtyIndex !== value) {
            this._selectedSpecialtyIndex = value;
            this.notifyPropertyChange('selectedSpecialtyIndex', value);
        }
    }

    get selectedDoctor(): Doctor | null {
        return this._selectedDoctor;
    }

    get isDoctorSelected(): boolean {
        return this._isDoctorSelected;
    }

    get patientName(): string {
        return this._patientName;
    }

    set patientName(value: string) {
        if (this._patientName !== value) {
            this._patientName = value;
            this.notifyPropertyChange('patientName', value);
        }
    }

    get patientAge(): string {
        return this._patientAge;
    }

    set patientAge(value: string) {
        if (this._patientAge !== value) {
            this._patientAge = value;
            this.notifyPropertyChange('patientAge', value);
        }
    }

    get patientPhone(): string {
        return this._patientPhone;
    }

    set patientPhone(value: string) {
        if (this._patientPhone !== value) {
            this._patientPhone = value;
            this.notifyPropertyChange('patientPhone', value);
        }
    }

    get selectedDate(): string {
        return this._selectedDate;
    }

    get selectedTime(): string {
        return this._selectedTime;
    }

    selectDoctor(index: number): void {
        try {
            if (!this._doctorsData || index < 0 || index >= this._doctorsData.length) {
                console.warn("Invalid doctor index:", index);
                return;
            }
            this._selectedDoctorIndex = index;
            this._selectedDoctor = this._doctorsData[index];
            this._isDoctorSelected = true;
            this.notifyPropertyChange('selectedDoctor', this._selectedDoctor);
            this.notifyPropertyChange('isDoctorSelected', this._isDoctorSelected);
            console.log("Doctor selected:", this._selectedDoctor?.name);
        } catch (error) {
            console.error('Error selecting doctor:', error);
        }
    }

    selectSpecialty(index: number): void {
        this._selectedSpecialtyIndex = index;
    }

    showDatePicker(): void {
        dialogs.action({
            message: "Select Appointment Date",
            cancelButtonText: "Cancel",
            actions: this.getNextDates()
        }).then((result) => {
            if (result !== "Cancel") {
                this._selectedDate = result;
                this.notifyPropertyChange('selectedDate', this._selectedDate);
            }
        }).catch(error => console.error('Error showing date picker:', error));
    }

    showTimePicker(): void {
        const timeSlots = ["09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"];
        dialogs.action({
            message: "Select Appointment Time",
            cancelButtonText: "Cancel",
            actions: timeSlots
        }).then((result) => {
            if (result !== "Cancel") {
                this._selectedTime = result;
                this.notifyPropertyChange('selectedTime', this._selectedTime);
            }
        }).catch(error => console.error('Error showing time picker:', error));
    }

    private getNextDates(): string[] {
        const dates: string[] = [];
        const today = new Date();
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            const dateStr = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
            dates.push(dateStr);
        }
        return dates;
    }

    bookAppointment(): { success: boolean; message: string } {
        try {
            if (!this._patientName.trim()) return { success: false, message: 'Please enter patient name' };
            if (!this._patientAge.trim() || isNaN(Number(this._patientAge))) return { success: false, message: 'Please enter a valid age' };
            if (!this._patientPhone.trim()) return { success: false, message: 'Please enter phone number' };
            if (this._selectedDate === 'Select Date') return { success: false, message: 'Please select appointment date' };
            if (this._selectedTime === 'Select Time') return { success: false, message: 'Please select appointment time' };

            const appointment = {
                doctor: this._selectedDoctor ? this._selectedDoctor.name : "Unknown Doctor",
                specialty: this._specialties[this._selectedSpecialtyIndex],
                patientName: this._patientName,
                patientAge: this._patientAge,
                patientPhone: this._patientPhone,
                date: this._selectedDate,
                time: this._selectedTime,
                timestamp: new Date().toISOString()
            };

            let appointments: any[] = [];
            try {
                const stored = ApplicationSettings.getString('appointments', '[]');
                appointments = JSON.parse(stored);
                if (!Array.isArray(appointments)) appointments = [];
            } catch {
                appointments = [];
            }

            appointments.push(appointment);
            ApplicationSettings.setString('appointments', JSON.stringify(appointments));

            const message = 
                `Appointment booked successfully!\n\n` +
                `Doctor: ${this._selectedDoctor?.name || "Unknown Doctor"}\n` +
                `Specialty: ${this._specialties[this._selectedSpecialtyIndex]}\n` +
                `Date: ${this._selectedDate}\n` +
                `Time: ${this._selectedTime}\n\n` +
                `Patient: ${this._patientName}`;

            return { success: true, message };
        } catch (error) {
            console.error("Error booking appointment:", error);
            return { success: false, message: 'An error occurred while booking. Please try again.' };
        }
    }
}
