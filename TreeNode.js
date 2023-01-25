class TreeNode {
  constructor(val, pos, ctx) {
    this.val = val;
    this.ctx = ctx;

    this.radius = 10;

    this.pos = {
      x: pos.x,
      y: pos.y,
    };

    this.animQueue = [];
  }

  // takes into account animation
  getPos(curTime) {
    while (this.animQueue.length > 0) {
      var a = this.animQueue[0];
      if (curTime > a.startTime + a.duration) {
        this.finalizeAnimMove();
        continue;
      }
      var p = (curTime - a.startTime)*1.0 / a.duration;
      return {
        x: this.pos.x + p * a.dir.x,
        y: this.pos.y + p * a.dir.y,
      };
    }
    return {
      x: this.pos.x,
      y: this.pos.y,
    }
  }
  // set curTime = null if want animation to start
  // after last animation
  addAnimMove(startTime, dir) {
    if (startTime === null) {
      if (this.animQueue.length > 0) {
        var a = this.animQueue[this.animQueue.length - 1];
        startTime = a.startTime + a.duration;
      }
      else {
        startTime = Date.now();
      }
    }
    this.animQueue.push({
      startTime: startTime,
      duration: 500, // milliseconds
      animType: 'move',
      dir: {
        x: dir.x,
        y: dir.y,
      },
    });
  }
  // called when the animation is done,
  // sets the actual position
  finalizeAnimMove() {
    if (this.animQueue.length === 0) {
      // shouldn't actually happen
      return;
    }

    var a = this.animQueue.shift();
    this.pos.x += a.dir.x;
    this.pos.y += a.dir.y;
  }
}

//=====================================================
// custom queue

class Queue {
  constructor(maxSize) {
    this.arr = [];
    this.frontInd = 0;
    this.backInd = 0;
  }
  pushback(obj) {
    if (this.arr.length < maxSize) {
      this.arr.push(obj);
      this.frontInd = 0;
      this.backInd = this.arr.length - 1;
      return;
    }
    if (this.backInd == this.frontInd - 1
      || (this.backInd == maxSize - 1 && this.frontInd == 0)) {
      // full
      return;
    }
  }
  popfront() {
    return;
  }
}
