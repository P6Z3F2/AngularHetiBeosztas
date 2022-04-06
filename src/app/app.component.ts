import { InputModel } from 'src/app/models/input.model';
import { StatusModel } from 'src/app/models/status.model';
import { Component, OnInit, ViewChild } from '@angular/core';
import { CalendarOptions, EventInput } from '@fullcalendar/angular';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor(private modalService: NgbModal) { }
  counter: number = 0;
  deleteSucceed: boolean = false
  closeResult = '';
  @ViewChild('content') content: any;
  jsonInput: string = "";
  startDate: number = 0;
  startTime: number = 0;
  clickedEventName: string = ""
  clickedEventId: string = ""
  clickedEventStart: string = ""
  clickedEventEnd: string = ""
  isJSONInputTouched: boolean = false;
  isAddInputTouched: boolean = false;
  initailazed: boolean = false;
  JSONNotselected: boolean = true;
  WrongJSONFormat: boolean = true;
  inputObjects: InputModel[] = [];
  inputObject: InputModel = { date: 0, input: [{ s: "", sh: "", eh: "" }] };
  options: StatusModel[] = [
    { value: 'ph', viewValue: 'Fizikai jelenlét' },
    { value: 'ho', viewValue: 'Home office' },
    { value: 'fr', viewValue: 'Szabadnap' },
    { value: 'hl', viewValue: 'Szabadság' }
  ];
  selectedStatus: string = "";
  selectedHour: number = 0;
  hours: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  events: EventInput[] = []

  calendarOptions: CalendarOptions = {
    initialView: 'timeGridWeek',
    eventClick: this.handleEventClick.bind(this),
    aspectRatio: 2,
    events: [
    ],
  };

  handleEventClick(arg: any) {
    this.clickedEventName = arg.event._def.title
    this.clickedEventId = arg.event._def.publicId
    if (arg.event._def.allDay) {
      this.clickedEventStart = ''
      this.clickedEventEnd = ''
    } else {
      var strStart: string = arg.event._instance.range.start
      var strEnd: string = arg.event._instance.range.end
      var strStartArray: string[] = strStart.toString().split(' ')
      var strEndArray: string[] = strEnd.toString().split(' ')
      this.clickedEventStart = strStartArray[0] + ' ' + strStartArray[1] + ' ' + strStartArray[2] + ':' + strStartArray[3] + ' ' + strStartArray[4]
      this.clickedEventEnd = strEndArray[0] + ' ' + strEndArray[1] + ' ' + strEndArray[2] + ':' + strEndArray[3] + ' ' + strEndArray[4]
    }
    this.openModal(this.content)
  }

  openModal(id: string) {
    this.modalService.open(id);
  }

  open(content: any) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  deleteEvent() {
    for (let i = 0; i < this.events.length; i++) {
      if (this.events[i].id == this.clickedEventId) {
        this.events.splice(i, 1)
        this.calendarOptions.events = this.events
        this.deleteSucceed = true
        return
      }
    }
  }

  create() {

    this.JSONtouched()

    if (this.jsonInput == '') {
      return
    } else {
      try {
        this.inputObjects = JSON.parse(this.jsonInput)
      } catch (e) {
        this.WrongJSONFormat = true
        return
      }
      this.WrongJSONFormat = false;
      if (this.WrongJSONFormat) {
        return
      }
      for (let Input of this.inputObjects) {
        this.AddEvent(Input)
      }
    }
    this.initailazed = true
    this.JSONNotselected = false;
  }

  JSONtouched() {
    this.isJSONInputTouched = true;
  }

  AddEvent(Input: InputModel) {
    let color: string = ""
    let title: string = ""
    let allday: boolean = false
    if (Input.input[0].s == 'ph') {
      color = "green"
      title = "Fizikai jelenlét"
      allday = false
    }
    if (Input.input[0].s == 'ho') {
      color = "blue"
      title = "Home office"
      allday = false
    }
    if (Input.input[0].s == 'fr') {
      color = "black"
      title = "Szabadnap"
      allday = true
    }
    if (Input.input[0].s == 'hl') {
      color = "grey"
      title = "Szabadság"
      allday = true
    }
    let startDate: string = ""
    let endDate: string = ""
    if (Input.input[0].sh.toString().length == 4) {
      startDate = Input.date + 'T0' + Input.input[0].sh
    }
    else {
      startDate = Input.date + 'T' + Input.input[0].sh
    }
    if (Input.input[0].eh.toString().length == 4) {
      endDate = Input.date + 'T0' + Input.input[0].eh
    }
    else {
      endDate = Input.date + 'T' + Input.input[0].eh
    }
    if (!allday) {
      this.events.push({ id: this.counter.toString(), title: title, start: startDate, color: color, allDay: allday, end: endDate })
    } else {
      this.events.push({ id: this.counter.toString(), title: title, start: Input.date, color: color, allDay: allday })
    }
    this.calendarOptions.events = this.events
    this.counter++
  }

  readDate() {
    this.isAddInputTouched = true
    if (this.selectedStatus != "" && this.startDate != 0) {
      if ((this.selectedStatus == "ph" || this.selectedStatus == "ho") && this.startTime != 0) {
        let szam: number = parseInt(this.startTime.toString()) + parseInt(this.selectedHour.toString())
        let ujszam: string = ""
        if (szam.toString().length == 1) {
          ujszam = '0' + szam + ':00'
        } else {
          ujszam = szam + ':00'
        }
        let input: InputModel = { date: this.startDate, input: [{ s: this.selectedStatus, sh: this.startTime.toString(), eh: ujszam }] }
        this.inputObjects.push(input)
      } else if (this.selectedStatus == "fr" || this.selectedStatus == "hl") {
        let input: InputModel = { date: this.startDate, input: [{ s: this.selectedStatus, sh: "", eh: "" }] }
        this.inputObjects.push(input)
      } else {
        return
      }
      this.AddEvent(this.inputObjects[this.inputObjects.length - 1])
      this.selectedStatus = ""
      this.startDate = 0
      this.startTime = 0
      this.isAddInputTouched = false
    }
  }
}
