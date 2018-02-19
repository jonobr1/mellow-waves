(function() {

  var root = this;
  var previousSequencer = root.Sequencer || {};

  var Sequencer = root.Sequencer = function(ctx) {

    this.ctx = ctx;
    this.registry = new Two.Registry();

  };

  Sequencer.prototype.bpm = 120;
  Sequencer.prototype.running = false;

  Sequencer.prototype.start = function() {
    this.running = true;
    for (var id in this.registry.map) {
      var sound = this.registry.map[id];
      sound.play();
    }
    return this;
  };

  Sequencer.prototype.pause = function() {
    this.running = false;
    for (var id in this.registry.map) {
      var sound = this.registry.map[id];
      sound.pause();
    }
    return this;
  };

  Sequencer.prototype.stop = function() {
    this.running = false;
    for (var id in this.registry.map) {
      var sound = this.registry.map[id];
      sound.stop();
    }
    return this;
  };

  /**
   * Register a `Sound` with the sequencer and define
   * the looped interval at which it should play.
   */
  Sequencer.prototype.add = function(sound, frequency) {

    var scope = this;

    if (!sound.uuid) {
      sound.uuid = THREE.Math.generateUUID();
    }

    if (this.registry.contains(sound.uuid)) {
      return this;
    }

    this.registry.add(sound.uuid, {
      sound: sound,
      frequency: frequency
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
      if (elapsed > frequency / bps) {
        sound.play();
      }

    }

    return this;

  };

})();
