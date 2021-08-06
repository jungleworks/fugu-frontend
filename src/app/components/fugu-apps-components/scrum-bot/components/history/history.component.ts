import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonService } from '../../../../../services/common.service';
import { SessionService } from '../../../../../services/session.service';
const res = [
  {
    report_id: 1,
    report_name: 'Test1',
    report_start_date: new Date(),
    report_responses: [
      {
        user_id: 123,
        full_name: 'Shashank',
        report_answer_datetime: new Date(),
        report_questions: [
          {
            report_question_id: 1,
            report_question: 'What did you do yesterday?',
            report_answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed nec eleifend quam, ornare vehicula libero. Pellentesque eu lacinia lorem. Fusce sed diam a magna sodales vestibulum in ut mi. Maecenas vitae sagittis nisl. Aenean dictum commodo eros feugiat porta. Vestibulum non tempor augue.'
          },
          {
            report_question_id: 2,
            report_question: 'What do you plan on doing today?',
            report_answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed nec eleifend quam, ornare vehicula libero. Pellentesque eu lacinia lorem. Fusce sed diam a magna sodales vestibulum in ut mi. Maecenas vitae sagittis nisl. Aenean dictum commodo eros feugiat porta. Vestibulum non tempor augue.'
          },
          {
            report_question_id: 3,
            report_question: 'Okay, any obstacles?',
            report_answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed nec eleifend quam, ornare vehicula libero. Pellentesque eu lacinia lorem. Fusce sed diam a magna sodales vestibulum in ut mi. Maecenas vitae sagittis nisl. Aenean dictum commodo eros feugiat porta. Vestibulum non tempor augue.'
          },
        ]
      },
      {
        user_id: 456,
        full_name: 'Rajat',
        report_answer_datetime: new Date(),
        report_questions: [
          {
            report_question_id: 1,
            report_question: 'What did you do yesterday?',
            report_answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed nec eleifend quam, ornare vehicula libero. Pellentesque eu lacinia lorem. Fusce sed diam a magna sodales vestibulum in ut mi. Maecenas vitae sagittis nisl. Aenean dictum commodo eros feugiat porta. Vestibulum non tempor augue.'
          },
          {
            report_question_id: 2,
            report_question: 'What do you plan on doing today?',
            report_answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed nec eleifend quam, ornare vehicula libero. Pellentesque eu lacinia lorem. Fusce sed diam a magna sodales vestibulum in ut mi. Maecenas vitae sagittis nisl. Aenean dictum commodo eros feugiat porta. Vestibulum non tempor augue.'
          },
          {
            report_question_id: 3,
            report_question: 'Okay, any obstacles?',
            report_answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed nec eleifend quam, ornare vehicula libero. Pellentesque eu lacinia lorem. Fusce sed diam a magna sodales vestibulum in ut mi. Maecenas vitae sagittis nisl. Aenean dictum commodo eros feugiat porta. Vestibulum non tempor augue.'
          },
        ]
      },
      {
        user_id: 123,
        full_name: 'Jaggi',
        report_answer_datetime: new Date(),
        report_questions: [
        ]
      }
    ]
  },
  {
    report_id: 2,
    report_name: 'Test2',
    report_start_date: new Date(),
    report_responses: [
      {
        user_id: 123,
        full_name: 'Shashank',
        report_answer_datetime: new Date(),
        report_questions: [
        ]
      },
      {
        user_id: 456,
        full_name: 'Rajat',
        report_answer_datetime: new Date(),
        report_questions: [
        ]
      },
      {
        user_id: 123,
        full_name: 'Jaggi',
        report_answer_datetime: new Date(),
        report_questions: [
        ]
      }
    ]
  },
  {
    report_id: 3,
    report_name: 'Test3',
    report_start_date: new Date(),
    report_responses: [
      {
        user_id: 123,
        full_name: 'Shashank',
        report_answer_datetime: new Date(),
        report_questions: [
          {
            report_question_id: 1,
            report_question: 'What did you do yesterday?',
            report_answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed nec eleifend quam, ornare vehicula libero. Pellentesque eu lacinia lorem. Fusce sed diam a magna sodales vestibulum in ut mi. Maecenas vitae sagittis nisl. Aenean dictum commodo eros feugiat porta. Vestibulum non tempor augue.'
          },
          {
            report_question_id: 2,
            report_question: 'What do you plan on doing today?',
            report_answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed nec eleifend quam, ornare vehicula libero. Pellentesque eu lacinia lorem. Fusce sed diam a magna sodales vestibulum in ut mi. Maecenas vitae sagittis nisl. Aenean dictum commodo eros feugiat porta. Vestibulum non tempor augue.'
          },
          {
            report_question_id: 3,
            report_question: 'Okay, any obstacles?',
            report_answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed nec eleifend quam, ornare vehicula libero. Pellentesque eu lacinia lorem. Fusce sed diam a magna sodales vestibulum in ut mi. Maecenas vitae sagittis nisl. Aenean dictum commodo eros feugiat porta. Vestibulum non tempor augue.'
          },
        ]
      },
      {
        user_id: 456,
        full_name: 'Rajat',
        report_answer_datetime: new Date(),
        report_questions: [
          {
            report_question_id: 1,
            report_question: 'What did you do yesterday?',
            report_answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed nec eleifend quam, ornare vehicula libero. Pellentesque eu lacinia lorem. Fusce sed diam a magna sodales vestibulum in ut mi. Maecenas vitae sagittis nisl. Aenean dictum commodo eros feugiat porta. Vestibulum non tempor augue.'
          },
          {
            report_question_id: 2,
            report_question: 'What do you plan on doing today?',
            report_answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed nec eleifend quam, ornare vehicula libero. Pellentesque eu lacinia lorem. Fusce sed diam a magna sodales vestibulum in ut mi. Maecenas vitae sagittis nisl. Aenean dictum commodo eros feugiat porta. Vestibulum non tempor augue.'
          },
          {
            report_question_id: 3,
            report_question: 'Okay, any obstacles?',
            report_answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed nec eleifend quam, ornare vehicula libero. Pellentesque eu lacinia lorem. Fusce sed diam a magna sodales vestibulum in ut mi. Maecenas vitae sagittis nisl. Aenean dictum commodo eros feugiat porta. Vestibulum non tempor augue.'
          },
        ]
      },
      {
        user_id: 123,
        full_name: 'Jaggi',
        report_answer_datetime: new Date(),
        report_questions: [
        ]
      }
    ]
  },
  {
    report_id: 4,
    report_name: 'Test4',
    report_start_date: new Date(),
    report_responses: [
      {
        user_id: 123,
        full_name: 'Shashank',
        report_answer_datetime: new Date(),
        report_questions: [
          {
            report_question_id: 1,
            report_question: 'What did you do yesterday?',
            report_answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed nec eleifend quam, ornare vehicula libero. Pellentesque eu lacinia lorem. Fusce sed diam a magna sodales vestibulum in ut mi. Maecenas vitae sagittis nisl. Aenean dictum commodo eros feugiat porta. Vestibulum non tempor augue.'
          },
          {
            report_question_id: 2,
            report_question: 'What do you plan on doing today?',
            report_answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed nec eleifend quam, ornare vehicula libero. Pellentesque eu lacinia lorem. Fusce sed diam a magna sodales vestibulum in ut mi. Maecenas vitae sagittis nisl. Aenean dictum commodo eros feugiat porta. Vestibulum non tempor augue.'
          },
          {
            report_question_id: 3,
            report_question: 'Okay, any obstacles?',
            report_answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed nec eleifend quam, ornare vehicula libero. Pellentesque eu lacinia lorem. Fusce sed diam a magna sodales vestibulum in ut mi. Maecenas vitae sagittis nisl. Aenean dictum commodo eros feugiat porta. Vestibulum non tempor augue.'
          },
        ]
      },
      {
        user_id: 456,
        full_name: 'Rajat',
        report_answer_datetime: new Date(),
        report_questions: [
          {
            report_question_id: 1,
            report_question: 'What did you do yesterday?',
            report_answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed nec eleifend quam, ornare vehicula libero. Pellentesque eu lacinia lorem. Fusce sed diam a magna sodales vestibulum in ut mi. Maecenas vitae sagittis nisl. Aenean dictum commodo eros feugiat porta. Vestibulum non tempor augue.'
          },
          {
            report_question_id: 2,
            report_question: 'What do you plan on doing today?',
            report_answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed nec eleifend quam, ornare vehicula libero. Pellentesque eu lacinia lorem. Fusce sed diam a magna sodales vestibulum in ut mi. Maecenas vitae sagittis nisl. Aenean dictum commodo eros feugiat porta. Vestibulum non tempor augue.'
          },
          {
            report_question_id: 3,
            report_question: 'Okay, any obstacles?',
            report_answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed nec eleifend quam, ornare vehicula libero. Pellentesque eu lacinia lorem. Fusce sed diam a magna sodales vestibulum in ut mi. Maecenas vitae sagittis nisl. Aenean dictum commodo eros feugiat porta. Vestibulum non tempor augue.'
          },
        ]
      },
      {
        user_id: 123,
        full_name: 'Jaggi',
        report_answer_datetime: new Date(),
        report_questions: [
        ]
      }
    ]
  }
];
@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HistoryComponent implements OnInit {
  date_range_picker_obj = {
    start_date: this.createFormattedDate(new Date(), -6),
    end_date: this.createFormattedDate(new Date(), 0)
  };
  spaceData;
  availableReports = [];
  choosenReports = {};
  filterType = '0';
  respondentsType = 0;
  isHideEmptyAnswers = false;
  showChooseReportBox = false;
  show_date_range_picker;
  range_max_date = this.createFormattedDate(new Date(), 0);
  constructor(public commonService: CommonService, public sessionService: SessionService) { }

  ngOnInit() {
    window['s'] = this;
    this.spaceData = this.sessionService.get('currentSpace');
    this.getReports();
  }
  onReportChoose(item) {
    if (this.choosenReports[item.report_id]) {
      delete this.choosenReports[item.report_id];
    } else {
      this.choosenReports[item.report_id] = item;
    }
  }
  getReports(start_date?, end_date?, reports?) {
    this.availableReports = res;
    this.availableReports.map(el => this.choosenReports[el.report_id] = el);
    this.availableReports.map(el => {
      const obj = {
        reportees: []
      };
      el.questions = {};
      el.report_responses.map(user => {
        obj.reportees.push({
          user_id: user.user_id,
          full_name: user.full_name,
          report_answer_datetime: user.report_answer_datetime
        });
        user.report_questions.map(question => {
          obj['report_question_id'] = question.report_question_id;
          obj['report_question'] = question.report_question;
          obj.reportees[obj.reportees.length - 1]['report_answer'] = question.report_answer;
          el.questions[question.report_question_id] = { ...obj };
          // el.questions.push({...obj});
        });
      });
    });
  }
  setChoosenReportsName() {
    const name = Object.values(this.choosenReports).map(el => el['report_name']);
    const str = name.join(', ');
    return str;
  }
  onChooseReportClickOutside(event) {
    if (event && event.value == true &&
      !this.commonService.checkClassContains(['report-option', 'checkbox-input', 'report-option-name'], event.target.classList)) {
      this.showChooseReportBox = false;
    }
  }
  onDateSelected(data) {
    this.date_range_picker_obj = {
      start_date: data.start_date,
      end_date: data.end_date
    };
    // this.getUserLeave();
  }


  createFormattedDate(date, no_of_days) {
    date.setDate(date.getDate() + no_of_days);
    return this.formatDate(date);
  }

  formatDate(date) {
    return new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
      .toISOString()
      .split('T')[0];
  }

}
