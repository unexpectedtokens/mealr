package mediahandler

import (
	"context"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"time"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/awserr"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
	"github.com/aws/aws-sdk-go/service/s3/s3manager"
	"github.com/unexpectedtokens/mealr/util"
)




type S3Config struct{
	Region, AKID, SAK, BucketName string
}

type S3Conn struct{
	S3Config
	Session *session.Session
}

var BucketName string



var S3Connection *S3Conn

func InitiateConn(cfg S3Config) error{
	sess, err := session.NewSession(
		&aws.Config{
			Region: aws.String(cfg.Region),
			Credentials: credentials.NewStaticCredentials(
				cfg.AKID,
				cfg.SAK,
				"",
			),
		},
	)
	if err != nil{
		return fmt.Errorf("error instantiating s3 connection: %s", err.Error())
	}
	
	S3Connection = &S3Conn{
		S3Config: cfg,
		Session: sess,
	}
	return nil;
}


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


func (connec S3Conn) CreateBucketIfNotExist() error{
	
	sess := s3.New(session.Must(connec.Session, nil))	
	_, err :=sess.CreateBucket(&s3.CreateBucketInput{
		ACL: aws.String(s3.BucketCannedACLPublicRead),
		Bucket: aws.String(connec.BucketName),
		CreateBucketConfiguration: &s3.CreateBucketConfiguration{
		  LocationConstraint: aws.String(connec.Region),
		},
	  })
	  if err != nil {
		if aerr, ok := err.(awserr.Error); ok {
		  switch aerr.Code() {
		  case s3.ErrCodeBucketAlreadyExists:
			fmt.Println("Bucket name already in use!")
			return err
		  case s3.ErrCodeBucketAlreadyOwnedByYou:
			fmt.Println("Bucket already owned by you")
			return nil
		  default:
			return err
		  }
		}
	}
	return err
}

func (connec S3Conn) StoreImage(file io.Reader, filename string) (error){
	fmt.Println("uploading file to bucket")
	uploader := s3manager.NewUploader(connec.Session)
	ctx := context.Background()
	timeout, _ := context.WithTimeout(ctx, 4*time.Second)
	op, err := uploader.UploadWithContext(timeout, &s3manager.UploadInput{
		Bucket: aws.String(connec.BucketName),
		ACL: aws.String("public-read"),
		Key: aws.String(filename),
		Body: file,
	})
	
	if err != nil {
		return err
	}
	fmt.Println(op.Location)
	return nil;
}

func (connec S3Conn) DeleteImage(key string) (err error){
	fmt.Println("deleting file from bucket")
	s := s3.New(session.Must(S3Connection.Session, nil))
	ctx := context.Background()

	timeout, _ := context.WithTimeout(ctx, 4*time.Second)

	_, err = s.DeleteObjectWithContext(timeout, &s3.DeleteObjectInput{
		Key: aws.String(key),
		Bucket: aws.String(connec.BucketName),
	})
	if err != nil{
		return err
	}
	return
}
