package logging

import "testing"


func TestLogging(t *testing.T){
	if !Logger("testing if the logfunctionality works", "test", "../Log/"){
		t.Error("Logging doesn't work")
	}

}
