import { Observable, ApplicationSettings, Utils } from '@nativescript/core';

interface WeekData {
    day1Steps: number;
    day2Steps: number;
    day3Steps: number;
    day4Steps: number;
    day5Steps: number;
    day6Steps: number;
    day7Steps: number;
    day1Height: number;
    day2Height: number;
    day3Height: number;
    day4Height: number;
    day5Height: number;
    day6Height: number;
    day7Height: number;
}

export class StepCounterViewModel extends Observable {
    private _stepsToday: number = 0;
    private _dailyGoal: number = 10000;
    private _isTracking: boolean = false;
    private _intervalId: any = null;
    private _statusMessage: string = '👟 Tap Start to begin tracking';
    private _weekData: WeekData;

    constructor() {
        super();
        this.loadSteps();
        this.loadWeekData();
        this.initializeSensor();
    }

    // === GETTERS ===
    get stepsToday(): number {
        return this._stepsToday;
    }

    get dailyGoal(): number {
        return this._dailyGoal;
    }

    get progressPercentage(): number {
        return Math.min(100, Math.round((this._stepsToday / this._dailyGoal) * 100));
    }

    get progressWidth(): string {
        return `${this.progressPercentage}%`;
    }

    get caloriesBurned(): string {
        return Math.round(this._stepsToday * 0.04).toString();
    }

    get distanceKm(): string {
        return (this._stepsToday * 0.0008).toFixed(2);
    }

    get activeMinutes(): string {
        return Math.round(this._stepsToday / 100).toString();
    }

    get isTracking(): boolean {
        return this._isTracking;
    }

    get statusMessage(): string {
        return this._statusMessage;
    }

    get weekData(): WeekData {
        return this._weekData;
    }

    // === INITIALIZATION ===
    private initializeSensor(): void {
        try {
            if (Utils.android) {
                this._statusMessage = '✅ Step sensor initialized. Ready to track!';
            } else {
                this._statusMessage = '⚠️ Step tracking available on Android only.';
            }
            this.notifyPropertyChange('statusMessage', this._statusMessage);
        } catch (error) {
            console.error('Error initializing sensor:', error);
            this._statusMessage = '❌ Unable to initialize step sensor.';
            this.notifyPropertyChange('statusMessage', this._statusMessage);
        }
    }

    // === MAIN FUNCTIONS ===
    startTracking(): void {
        try {
            if (this._isTracking) return;

            this._isTracking = true;
            this._statusMessage = '🟢 Tracking active — Keep walking!';
            this.notifyPropertyChange('isTracking', this._isTracking);
            this.notifyPropertyChange('statusMessage', this._statusMessage);

            this._intervalId = setInterval(() => {
                this.simulateSteps();
            }, 2000);
        } catch (error) {
            console.error('Error starting tracking:', error);
            this._statusMessage = '❌ Error starting tracker.';
            this.notifyPropertyChange('statusMessage', this._statusMessage);
        }
    }

    stopTracking(): void {
        try {
            if (!this._isTracking) return;

            this._isTracking = false;
            this._statusMessage = '⏸️ Tracking paused.';
            if (this._intervalId) {
                clearInterval(this._intervalId);
                this._intervalId = null;
            }
            this.saveSteps();
            this.notifyPropertyChange('isTracking', this._isTracking);
            this.notifyPropertyChange('statusMessage', this._statusMessage);
        } catch (error) {
            console.error('Error stopping tracking:', error);
        }
    }

    resetSteps(): void {
        try {
            this.stopTracking();
            this._stepsToday = 0;
            this.saveSteps();
            this._statusMessage = '🔄 Steps reset to zero.';
            this.notifyAllProperties();
        } catch (error) {
            console.error('Error resetting steps:', error);
        }
    }

    // === STEP SIMULATION (replace with real pedometer later) ===
    private simulateSteps(): void {
        const randomSteps = Math.floor(Math.random() * 25) + 10;
        this._stepsToday += randomSteps;
        this.saveSteps();
        this.updateTodayInWeek();
        this.notifyAllProperties();

        if (this._stepsToday >= this._dailyGoal && this._stepsToday - randomSteps < this._dailyGoal) {
            this._statusMessage = '🎉 Congratulations! Daily goal achieved!';
            this.notifyPropertyChange('statusMessage', this._statusMessage);
        }
    }

    // === STORAGE FUNCTIONS ===
    private loadSteps(): void {
        try {
            const today = new Date().toDateString();
            const savedDate = ApplicationSettings.getString('stepCountDate', '');
            if (savedDate === today) {
                this._stepsToday = ApplicationSettings.getNumber('todaySteps', 0);
            } else {
                this.saveToHistory();
                this._stepsToday = 0;
                ApplicationSettings.setString('stepCountDate', today);
                ApplicationSettings.setNumber('todaySteps', 0);
            }
            this.notifyAllProperties();
        } catch (error) {
            console.error('Error loading steps:', error);
            this._stepsToday = 0;
        }
    }

    private saveSteps(): void {
        try {
            ApplicationSettings.setNumber('todaySteps', this._stepsToday);
            ApplicationSettings.setString('stepCountDate', new Date().toDateString());
        } catch (error) {
            console.error('Error saving steps:', error);
        }
    }

    private saveToHistory(): void {
        try {
            const weekHistoryStr = ApplicationSettings.getString('weekHistory', '[]');
            const weekHistory = JSON.parse(weekHistoryStr);
            weekHistory.unshift(this._stepsToday);
            if (weekHistory.length > 7) weekHistory.pop();
            ApplicationSettings.setString('weekHistory', JSON.stringify(weekHistory));
        } catch (error) {
            console.error('Error saving history:', error);
        }
    }

    // === WEEK DATA ===
    private loadWeekData(): void {
        try {
            const weekHistoryStr = ApplicationSettings.getString('weekHistory', '[]');
            const weekHistory = JSON.parse(weekHistoryStr);
            const days = ['day1', 'day2', 'day3', 'day4', 'day5', 'day6', 'day7'];
            this._weekData = {} as WeekData;
            for (let i = 0; i < 7; i++) {
                const steps = weekHistory[i] || Math.floor(Math.random() * 8000) + 2000;
                const height = Math.min(150, Math.max(20, (steps / this._dailyGoal) * 150));
                this._weekData[`${days[i]}Steps`] = steps;
                this._weekData[`${days[i]}Height`] = height;
            }
            this.notifyPropertyChange('weekData', this._weekData);
        } catch (error) {
            console.error('Error loading week data:', error);
            this.initializeDefaultWeekData();
        }
    }

    private initializeDefaultWeekData(): void {
        this._weekData = {
            day1Steps: 5234, day2Steps: 7891, day3Steps: 6543,
            day4Steps: 9102, day5Steps: 4567, day6Steps: 8234,
            day7Steps: this._stepsToday,
            day1Height: 78, day2Height: 118, day3Height: 98,
            day4Height: 136, day5Height: 68, day6Height: 123,
            day7Height: Math.min(150, (this._stepsToday / this._dailyGoal) * 150)
        };
        this.notifyPropertyChange('weekData', this._weekData);
    }

    private updateTodayInWeek(): void {
        if (!this._weekData) return;
        this._weekData.day7Steps = this._stepsToday;
        this._weekData.day7Height = Math.min(150, (this._stepsToday / this._dailyGoal) * 150);
        this.notifyPropertyChange('weekData', this._weekData);
    }

    private notifyAllProperties(): void {
        this.notifyPropertyChange('stepsToday', this._stepsToday);
        this.notifyPropertyChange('progressPercentage', this.progressPercentage);
        this.notifyPropertyChange('progressWidth', this.progressWidth);
        this.notifyPropertyChange('caloriesBurned', this.caloriesBurned);
        this.notifyPropertyChange('distanceKm', this.distanceKm);
        this.notifyPropertyChange('activeMinutes', this.activeMinutes);
    }
}
