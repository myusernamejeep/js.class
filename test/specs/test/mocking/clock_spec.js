Test.Mocking = {
  ClockSpec: JS.Test.describe(JS.Test.Mocking.Clock, function() {
    include(JS.Test.Mocking.Clock)
    
    before(function() { clock.stub() })
    after(function() { clock.reset() })
    
    describe("setTimeout", function() {
      before(function() {
        this.calls = 0
        this.timer = setTimeout(function() { calls += 1 }, 1000)
      })
      
      it("runs the timeout after clock has ticked enough", function() {
        clock.tick(1000)
        assertEqual( 1, calls )
      })
      
      it("runs the timeout after time has accumulated", function() {
        clock.tick(500)
        assertEqual( 0, calls )
        clock.tick(500)
        assertEqual( 1, calls )
      })
      
      it("only runs the timeout once", function() {
        clock.tick(1500)
        assertEqual( 1, calls )
        clock.tick(1500)
        assertEqual( 1, calls )
      })
      
      it("does not run the callback if it is cleared", function() {
        clearTimeout(timer)
        clock.tick(1000)
        assertEqual( 0, calls )
      })
      
      describe("with nested calls", function() {
        before(function() {
          this.calls = 0
          setTimeout(function() {
            setTimeout(function() { calls += 1 }, 100)
          }, 50)
        })
        
        it("schedules chains of functions correctly", function() {
          clock.tick(150)
          assertEqual( 1, calls )
        })
      })
    })
    
    describe("setInterval", function() {
      before(function() {
        this.calls = 0
        this.timer = setInterval(function() { calls += 1 }, 1000)
      })
      
      it("runs the timeout after clock has ticked enough", function() {
        clock.tick(1000)
        assertEqual( 1, calls )
      })
      
      it("runs the timeout after time has accumulated", function() {
        clock.tick(500)
        assertEqual( 0, calls )
        clock.tick(500)
        assertEqual( 1, calls )
      })
      
      it("runs the timeout repeatedly", function() {
        clock.tick(1500)
        assertEqual( 1, calls )
        clock.tick(1500)
        assertEqual( 3, calls )
      })
      
      it("does not run the callback if it is cleared", function() {
        clearInterval(timer)
        clock.tick(1000)
        assertEqual( 0, calls )
      })
    })
  })
}
