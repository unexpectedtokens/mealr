package mediahandler

import (
	"fmt"
	"os"
	"path/filepath"

	"github.com/unexpectedtokens/mealr/util"
)


func CheckIfDirsExistOrCreate() {
	mediaDir := filepath.Join(util.Root, "media")
	fmt.Println(mediaDir)
	recipeBannerDir := filepath.Join(mediaDir, "recipebanners")
	if _, err := os.Stat(mediaDir); os.IsNotExist(err) {
		os.Mkdir(mediaDir, 0700)
	}
	if _, err := os.Stat(recipeBannerDir); os.IsNotExist(err){
		os.Mkdir(recipeBannerDir, 0700)
	}
}


func StoreImage(recipeid int, file os.File){
	

}