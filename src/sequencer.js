(function() {

  var root = this;
  var previousSequencer = root.Sequencer || {};

  var Sequencer = root.Sequencer = function(ctx) {

    this.ctx = ctx;
    this.registry = new Two.Registry();

  };

  Sequencer.Resolution = 32;
  Sequencer.Buffer = 0.01; // In seconds to stay in time

  Sequencer.prototype.bpm = 120;
  Sequencer.prototype.running = false;
  Sequencer.prototype.interval = null;

  Sequencer.prototype.start = function() {
    var scope = this;
    this.running = true;
    for (var id in this.registry.map) {
      var sound = this.registry.map[id];
      sound.play();
    }
    if (this.interval) {
      clearInterval(this.interval);
    }
    this.interval = setInterval(function() {
      scope.update();
    }, 1000 * (60 / this.bpm) / Sequencer.Resolution);
    return this;
  };

  Sequencer.prototype.pause = function() {
    this.running = false;
    for (var id in this.registry.map) {
      var sound = this.registry.map[id];
      sound.pause();
    }
    clearInterval(this.interval);
    this.interval = null;
    return this;
  };

  Sequencer.prototype.stop = function() {
    this.running = false;
    for (var id in this.registry.map) {
      var sound = this.registry.map[id];
      sound.stop();
    }
    clearInterval(this.interval);
    this.interval = null;
    return this;
  };

  /**
   * Register a `Sound` with the sequencer and define
   * the looped interval at which it should play.
   */
  Sequencer.prototype.add = function(sound, frequency, callback) {

    var scope = this;

    if (!sound.uuid) {
      sound.uuid = THREE.Math.generateUUID();
    }

    if (this.registry.contains(sound.uuid)) {
      return this;
    }

    this.registry.add(sound.uuid, {
      sound: sound,
      frequency: frequency,
      callback: callback
    });

    if (this.running) {
      sound.play();
    }

    return this;

  };

  /**
   * Remove a `Sound` from the looped registry on the sequencer.
   */
  Sequencer.prototype.remove = function(sound) {

    this.registry.remove(sound.uuid);

    return this;

  };

  Sequencer.prototype.update = function() {

    if (!this.running) {
      return this;
    }

    var now = this.ctx.currentTime;
    var bps = this.bpm / 60;

    for (var id in this.registry.map) {

      var item = this.registry.map[id];
      var sound = item.sound;
      var frequency = item.frequency;

      var elapsed = now - sound._startTime;
      var seconds = frequency / bps;

      if (elapsed > seconds - Sequencer.Buffer) {
        var startTime = sound._startTime;
        sound.play({
          time: startTime + seconds
        });
        if (item.callback) {
          item.callback();
        }
      }

    }

    return this;

  };

})();
