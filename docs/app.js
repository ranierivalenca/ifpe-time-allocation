let app = new Vue({
  el: '#app',
  data: {
    DAYS: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
    data: {},
    teachersData: {},
    selectedFile: false,
    selectedTeacher: false,
    selectedTeachers: [],
    selectedSchedules: [],
    teachersColors: {},
  },
  created() {
    this.fetchData('15.json')
    // setInterval(() => {
    //   this.fetchFiles()
    //   this.fetchData(this.selectedFile)
    // }, 1000)
  },
  methods: {
    fetchFiles() {
      // fetch('/available-allocations')
      //   .then(data => data.json())
      //   .then(data => {
      //     this.files = data
      //   })
      // this.files = {"0.json":680,"1.json":684,"2.json":672,"3.json":679,"4.json":703,"5.json":690,"6.json":682,"7.json":730,"8.json":693,"9.json":698,"10.json":716,"11.json":714,"12.json":709,"13.json":669,"14.json":672,"15.json":722,"16.json":698,"17.json":661,"18.json":674,"19.json":669,"20.json":679,"21.json":611,"22.json":645,"23.json":642,"24.json":654,"25.json":695,"26.json":636,"27.json":645,"28.json":695,"29.json":692}
      this.files = {}
    },
    fetchData(file) {
      if (!file) {
        return
      }
      this.selectedFile = file
      fetch(`${file}`)
        .then(data => data.json())
        .then(data => {
            this.data = data
            this.setTeachersData()
        })
    },
    setTeachersData() {
      let teachers = {}
      console.log(this.data)
      Object.values(this.data).forEach(klass => {
        if (!klass.times) {
          return
        }
        let times = klass.times
        let slots = klass.slots
        for (let day_idx = 0; day_idx < 5; day_idx++) {
          for (let slot_idx = 0; slot_idx < times.length; slot_idx++) {
            let slot = slots[day_idx][slot_idx]
            if (!slot) {
              continue
            }
            let slot_teachers = this.slotTeachers(slot)
            // console.log(slot, slot_teachers)
            slot_teachers.forEach(teacher => {
              let name = this.teacherName(teacher)
              if (!teachers[name]) {
                teachers[name] = Array(5).fill(null).map(d => Array())
              }
              teachers[name][day_idx].push([times[slot_idx], teacher])
            })
      //       for (let teacher of slot_teachers.map(st => this.teacherName(st))) {
      //         if (teacher == 'ranieri') {
      //           console.log(day_idx, slot_idx)
      //         }
      //         console.log(teacher, slot, times[slot_idx])
      //         // teachers[teacher][day_idx].push(times[slot_idx])
      //       }
          }
        }
      })
      let [h, l] = [0, 90]
      Object.keys(teachers).sort().forEach(name => {
        this.teachersColors[name] = {background: `hsl(${h}, 50%, ${l}%)`, color: `hsl(0, 0%, ${l > 50 ? 0 : 100}%)`}
        h += 30
        l += (h % 360 == 0) ? -40 : 0
      })
      Object.keys(teachers).forEach(name => {
        for (let i = 0; i < 5; i++) {
          teachers[name][i].sort((t1, t2) => t1[0][0] - t2[0][0])
        }
      })
      this.teachersData = teachers
    },
    teacherBadSlots(name) {
      let data = this.teachersData[name]
      if (!data) {
        return
      }
      let badSlots = 0
      data.forEach(day => {
        day.forEach(slot => {
          if (slot[1].split(':')[1] < 0) {
            badSlots++
          }
        })
      })
      return badSlots
    },
    teacherNeutralSlots(name) {
      let data = this.teachersData[name]
      if (!data) {
        return
      }
      let badSlots = 0
      data.forEach(day => {
        day.forEach(slot => {
          if (slot[1].split(':')[1] == 0) {
            badSlots++
          }
        })
      })
      return badSlots
    },
    teachersBadSlots() {
      let badSlots = 0
      for (teacher of Object.keys(this.teachersData)) {
        badSlots += this.teacherBadSlots(teacher)
      }
      return badSlots
    },
    teachersNeutralSlots() {
      let badSlots = 0
      for (teacher of Object.keys(this.teachersData)) {
        badSlots += this.teacherNeutralSlots(teacher)
      }
      return badSlots
    },
    teacherDays(name) {
      let data = this.teachersData[name]
      if (!data) {
        return
      }
      let days = 0
      data.forEach(day => {
        days += day.length > 0 ? 1 : 0
      })
      return days
    },
    formatTime(time) {
      let [start, end] = time.map(t => `0${Math.round(t*100).toString()}`.substr(-4).match(/../g).join(':'))
      return `${start} - ${end}`
    },
    slotDiscipline(slot) {
      if (!slot) {
        return ''
      }
      return slot.split('/')[0]
    },
    getDiscipline(schedule, day, slot) {
      if (!schedule) return
      return schedule.slots[day][slot]?.split('/')[0]
    },
    getTeachers(schedule, day, slot) {
      if (!schedule) return
      return schedule.slots[day][slot]?.split('/')[1]?.split(',').map(teacher => this.teacherName(teacher)).join(',')
    },
    slotTeachers(slot) {
      if (!slot) {
        return []
      }
      return slot.split('/')[1]?.split(',')
      // return slot.split(':')[0]
    },
    teacherClass(teacher) {
      let score = teacher.split(':')[1] ?? 1
      let selected = this.teacherName(teacher) == this.selectedTeacher ? 'bg-gray-900' : ''
      let intensity = selected ? 300 : 700
      if (score < 0) {
        return `${selected} text-red-${intensity} font-bold`
      }
      if (score == 0) {
        return `${selected} text-yellow-${intensity}`
      }
      if (score == 1) {
        return `${selected} text-indigo-${intensity}`
      }
      return `${selected} text-indigo-${intensity} font-bold`
    },
    teacherName(teacher) {
      return teacher.split(':')[0]
    },
    selectTeacher(teacher) {
      this.selectedTeachers = [teacher]
      // if (this.selectedTeachers.includes(teacher)) {
      //   let idx = this.selectedTeachers.indexOf(teacher)
      //   this.selectedTeachers = [...this.selectedTeachers.slice(0, idx), ...this.selectedTeachers.slice(idx + 1)]
      //   return
      // }
      // this.selectedTeachers.push(teacher)
    },
  }
})