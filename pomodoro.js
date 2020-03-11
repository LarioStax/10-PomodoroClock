const app = document.getElementById("app");

class TimerControls extends React.Component {
  render() {
    return(
      <div className="control-panel">
        <div id={this.props.label}>
          {this.props.title}
        </div>
        <div className="control-buttons">
	        <button value="-" onClick={this.props.onClick} id={this.props.decrement}>
	          <i class="fas fa-minus-circle"></i>
	        </button>
	        <div id={this.props.displayId}>
	        	{this.props.minutes}
	        </div>
	        <button value="+" onClick={this.props.onClick} id={this.props.increment}>
	          <i class="fas fa-plus-circle"></i>
	        </button>
	      </div>
      </div>
    )
  }
}

class Timer extends React.Component {
	render() {
		return (
			<div id="timer">
				<div id="timer-label">
					{this.props.label}
				</div>
				<div id="time-left">
					{formatTimer(this.props.count)}
				</div>
				<div>
					<button id="start_stop" onClick={this.props.start}>
						<i class="fas fa-play-circle"></i><i class="fas fa-pause-circle"></i>
					</button>
					<button id="reset" onClick={this.props.reset}>
						<i class="fas fa-stop-circle"></i>
					</button>
				</div>
			</div>
		)
	}
}

const formatTimer = (count) => {
	let minutes = Math.floor(count / 60);
	let seconds = count % 60;
	if (minutes < 10) {
		minutes = "0" + minutes;
	}
	if (seconds < 10) {
		seconds = "0" + seconds;
	}

	return (minutes + ":" + seconds);
}


class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			sessionLength: 25,
			breakLength: 5,
			started: false,
			type: "Session",
			count: 1500,
			interval: "",
		}
		this.decrementCount = this.decrementCount.bind(this);
		this.startCountDown = this.startCountDown.bind(this);
		this.reset = this.reset.bind(this);
		this.changeLength = this.changeLength.bind(this);
		this.changeSessionLength = this.changeSessionLength.bind(this);
		this.changeBreakLength = this.changeBreakLength.bind(this);
		this.timerControl = this.timerControl.bind(this);
		this.typeControl = this.typeControl.bind(this);
	}

	decrementCount() {
		this.setState({count: this.state.count -1});
	}

	startCountDown() {
		if (this.state.interval == "" || this.state.interval.cancel.name == "cancel") {
			this.setState({
				interval: accurateInterval(() => {
					this.decrementCount();
					this.typeControl();
				}, 1000),
			});
		}
	}

	timerControl() {
		if (this.state.started == true) {
			this.setState({started: false});
			this.state.interval.cancel();
		} else if (this.state.started == false) {
			this.setState({started: true});
			this.startCountDown();			
		}
	}

	changeLength(stateToChange, direction, currentLength, timerType) {
		if (this.state.started) { return };
		if (timerType == "Break") {
			if (direction == "-" && currentLength != 1) {
				this.setState({[stateToChange]: currentLength - 1});
			} else if (direction == "+" && currentLength != 60) {
				this.setState({[stateToChange]: currentLength + 1});
			}
		} else if (timerType == "Session") {
			if (direction == "-" && currentLength != 1) {
				this.setState({[stateToChange]: currentLength - 1, count: currentLength * 60 - 60});
			} else if (direction == "+" && currentLength != 60) {
				this.setState({[stateToChange]: currentLength + 1, count: currentLength * 60 + 60});
			}
		}
	}

	changeSessionLength(e) {
		this.changeLength("sessionLength", e.currentTarget.value, this.state.sessionLength, "Session");
	}

	changeBreakLength(e) {
		this.changeLength("breakLength", e.currentTarget.value, this.state.breakLength, "Break");
	}

	typeControl() {
		if (this.state.count === 0) {
			this.audioBeep.play();
		}
		if (this.state.count < 0) {
			if (this.state.interval !== "") {
					this.state.interval.cancel();
			}
			if (this.state.type == "Session") {
				this.startCountDown();
				this.setState({
					type: "Break",
					count: this.state.breakLength * 60,
				});
			} else {
				this.startCountDown();
				this.setState({
					type: "Session",
					count: this.state.sessionLength * 60,
				});
			}
		}
	}

	reset() {
		this.setState({
			sessionLength: 25,
			breakLength: 5,
			started: false,
			type: "Session",
			count: 1500,
			interval: "",
		})
		if (this.state.interval !== "") {
			this.state.interval.cancel();
		}
		this.audioBeep.pause();
		this.audioBeep.currentTime = 0;
	}


  render() {
    return(
    	<div id="wrapper">
    		<div id="header">
    			<h1>$tax Pomodoro Clock</h1>
    		</div>
	      <div id="clock">
	      	<TimerControls 
	      		label="break-label" 
	      		title="Break Length" 
	      		displayId="break-length"
	      		minutes={this.state.breakLength} 
	      		onClick={this.changeBreakLength}
	      		increment="break-increment"
	      		decrement="break-decrement"
	      	/>
	      	<Timer 
		      	count={this.state.count} 
		      	reset={this.reset} 
		      	start={this.timerControl}
		      	label={this.state.type} 
	      	/>
	        <TimerControls 
	        	label="session-label" 
	        	title="Session Length"
	        	displayId="session-length"
	        	minutes={this.state.sessionLength} 
	        	onClick={this.changeSessionLength}
	        	increment="session-increment"
	        	decrement="session-decrement" 
	        />

					{/* copied from someones project - do not quite understand how it works, nor where it comes from! */}
	        <audio id="beep" preload="auto" 
	          src="http://belltimers.com/images/asdl1_tone2.wav"
	          ref={(audio) => { this.audioBeep = audio; }} />
	      </div>
      </div>
    )
  }
}




ReactDOM.render(<App/>, app);



(function() {
  window.accurateInterval = function(fn, time) {
    var cancel, nextAt, timeout, wrapper;
    nextAt = new Date().getTime() + time;
    timeout = null;
    wrapper = function() {
      nextAt += time;
      timeout = setTimeout(wrapper, nextAt - new Date().getTime());
      return fn();
    };
    cancel = function() {
      return clearTimeout(timeout);
    };
    timeout = setTimeout(wrapper, nextAt - new Date().getTime());
    return {
      cancel: cancel
    };
  };
}).call(this);