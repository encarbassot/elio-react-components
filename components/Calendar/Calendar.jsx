import './Calendar.css'

import React, {useEffect, useState} from 'react';
import moment from 'moment';
import 'moment/locale/es'; // Import Spanish locale

// Set locale to Spanish
moment.locale('es');

export function Calendar({onChange,value,close,range=false}) {

  const startingDate = value?moment(value):moment()

  const [date, setDate] = useState(startingDate);
  const [startDate, setStartDate] = useState() //useState(moment().subtract(5, 'day'));
  const [endDate, setEndDate] = useState() //useState(moment().add(3, 'day'));
  
  const [page,setPage]=useState("days") // "days", "months", "years"
  
 

  useEffect(()=>{
    //initialize
    if(value){
      changeDate(moment(value),false)
    }

  },[value])

  //reset the date
  function resetDate(){
    setDate(moment());
  };


  function changeYear(year,isChangingDate=false){
    const newDate = moment(date).year(year);
    setDate(newDate);
    if(isChangingDate){
      changeDate(newDate)
    }
  }

  //change month
  function changeMonth(month,isChangingDate=false){
    const newDate = moment(date).month(month);
    setDate(newDate);
    if(isChangingDate){
      changeDate(newDate)
    }
  };
    


  //change the selected date
  const changeDate = (selectedDate,emmitChanges=true) => {
    let newStartDate = startDate;
    let newEndDate = endDate;



    if(!range){
      newStartDate = selectedDate
      newEndDate = selectedDate
      
    }else{

      //if selecting range, select previous or following depending
      if (
        startDate === null ||
        selectedDate.isBefore(startDate, 'day') ||
        !selectedDate.isSame(endDate, 'day')
      ) {
        newStartDate = moment(selectedDate);
        newEndDate = moment(selectedDate);
      } else if (selectedDate.isSame(startDate, 'day') && selectedDate.isSame(endDate, 'day')) {
        newStartDate = null;
        newEndDate = null;
      } else if (selectedDate.isAfter(startDate, 'day')) {
        newEndDate = moment(selectedDate);
      }
    }


    setStartDate(newStartDate);
    setEndDate(newEndDate);

    if(onChange && emmitChanges){
      const newDate = selectedDate.year()+"-"+String(selectedDate.month()+1).padStart(2,"0")+"-"+String(selectedDate.date()).padStart(2,"0")
      onChange(newDate)
    }
  };



 


  return (
    <div className="calendar"
    >
      <Calendar_Heading 
        date={date} 
        changeMonth={(month) => changeMonth(month)} 
        changeYear={(year) => changeYear(year)} 
        onClickMonth={() => setPage(prev=>prev==="days"?"months":"days")} 
        onClickYear={() => setPage(prev=>prev==="days"?"years":"days")} 
        page={page}
      />

      {page==="days" && 
      <Calendar_Days 
        onClick={(date) => changeDate(date)} 
        date={date} 
        startDate={startDate} 
        endDate={endDate} />
      }
      {page==="months" && 
        <Calendar_Months 
          date={date}
          onClick={(monthIndex)=>{changeMonth(monthIndex,true);setPage("days")}} 
        />
      }
      {page==="years" && 
        <Calendar_Years 
          date={date}
          onClick={(year)=>{changeYear(year,true);setPage("days")}} 
        />
      }
    </div>
  );
};



const Calendar_Heading = ({date, changeMonth,changeYear, onClickMonth,onClickYear, page}) => (
  <nav className="calendar--nav">
    {(page==="days") &&
      <a onClick={() => changeMonth(date.month() - 1)}>&#8249;</a>
    }
    {page==="years" &&
      <a onClick={() => changeYear(date.year() - 12)}>&#8249;</a>
    }
    {/* <h1 onClick={() => resetDate()}>{date.format('MMMM')} <small>{date.format('YYYY')}</small></h1> */}
    <h1 >
      <span onClick={onClickMonth}>
        {moment().month(date.month()).format('MMMM')} 
      </span>
      &nbsp;
      <span onClick={onClickYear}>{date.format('YYYY')}</span>
      {/* <small onClick={onClickYear}>{date.format('YYYY')}</small> */}
    </h1>
    {page==="days" && 
      <a onClick={() => changeMonth(date.month() + 1)}>&#8250;</a>
    }
    {page==="years" &&
      <a onClick={() => changeYear(date.year() + 12)}>&#8250;</a>
    }
  </nav>
);


  
const Calendar_Day = ({currentDate, date, startDate, endDate, onClick}) => {
  let className = [];

  if (moment().isSame(date, 'day')) {
    className.push('active');
  }

  if (date.isSame(startDate, 'day')) {
    className.push('start');
  }

  if (date.isBetween(startDate, endDate, 'day')) {
    className.push('between');
  }

  if (date.isSame(endDate, 'day')) {
    className.push('end');
  }

  if (! date.isSame(currentDate, 'month')) {
    className.push('muted');
  }

  return (
    <span onClick={() => onClick(date)} currentDate={date} className={className.join(' ')}>{date.date()}</span>
  )
};






const Calendar_Days = ({date, startDate, endDate, onClick,mondayFirst = true}) => {
  const thisDate = moment(date);
  const daysInMonth = moment(date).daysInMonth();
  const firstDayDate = moment(date).startOf('month');
  const previousMonth = moment(date).subtract(1, 'month');
  const previousMonthDays = previousMonth.daysInMonth();
  const nextsMonth = moment(date).add(1, 'month');

  const dayStr = Array.from({ length: 7 }, (_, i) =>
    moment().day(mondayFirst? i+1%7 :i).format('ddd').replace(".","")
  )

  const days = [];
  const daysBefore = []
  const daysAfter = []


  for (let i = firstDayDate.day(); i > 1; i--) {
    previousMonth.date(previousMonthDays - i + 2);

    daysBefore.push(
      <Calendar_Day key={moment(previousMonth).format('DD MM YYYY')} onClick={(date) => onClick(date)} currentDate={date} date={moment(previousMonth)} startDate={startDate} endDate={endDate} />
    );
  }

  for (let i = 1; i <= daysInMonth; i++) {
    thisDate.date(i);

    days.push(
      <Calendar_Day key={moment(thisDate).format('DD MM YYYY')} onClick={(date) => onClick(date)} currentDate={date} date={moment(thisDate)} startDate={startDate} endDate={endDate} />
    );
  }

  const daysCount = 42 - (days.length + daysBefore.length); //show total of 42 days on the calendar
  for (let i = 1; i <= daysCount; i++) {
    nextsMonth.date(i);
    daysAfter.push(
      <Calendar_Day key={moment(nextsMonth).format('DD MM YYYY')} onClick={(date) => onClick(date)} currentDate={date} date={moment(nextsMonth)} startDate={startDate} endDate={endDate} />
    );
  }

  return (
    <nav className="calendar--days">
      {dayStr.map((day,i) =>
        // Lun Mar Mie Jue Vie Sab Dom  
        <span key={i} className="label">{day}</span>
      )}

      {daysBefore.concat()}
      {days.concat()}
      {daysAfter.concat()}
    </nav>
  );
};




  
function Calendar_Months({onClick,date}){
  const active = moment(date).month()
  const monthNames = moment.months();

  return (
    <nav className="calendar--months">
      {monthNames.map((month,i)=>(
        <span key={i} onClick={()=>onClick(i)} className={active===i?"active":""}>{month}</span>
      ))}
    </nav>
  )
}


function Calendar_Years({onClick,date}){
  const year = moment(date).year()
  const startYear = Math.floor(year / 12) * 12;
  const yearRange = Array.from({ length: 12 }, (_, index) => startYear + index);

  return (
    <nav className="calendar--months">
      {yearRange.map((y)=>(
        <span key={i} onClick={()=>onClick(y)} className={year===y?"active":""}>{y}</span>
      ))}
    </nav>
  )
}