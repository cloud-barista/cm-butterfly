package handler

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"crypto/sha256"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
	"gopkg.in/yaml.v2"
)

const (
	tokenExpired        = time.Minute * 1
	refreshTokenExpired = time.Minute * 3
)

type CmigAuthSetting struct {
	Setting CmigSetting `yaml:"setting"`
	User    CmigUser    `yaml:"user"`
}

type CmigSetting struct {
	Encryptionkey string `yaml:"encryptionkey"`
}

type CmigUser struct {
	Id          string   `yaml:"id"`
	Password    string   `yaml:"password"`
	FirstName   string   `yaml:"firstName"`
	LastName    string   `yaml:"lastName"`
	Roles       []string `yaml:"roles"`
	Email       string   `yaml:"email"`
	Description string   `yaml:"description"`
	Company     string   `yaml:"company"`
}

type CmigUserLoginResponse struct {
	Accesstoken      string `json:"access_token"`
	ExpiresIn        int64  `json:"expires_in"`
	RefreshToken     string `json:"refresh_token"`
	RefreshExpiresIn int64  `json:"refresh_expires_in"`
}

type CmigAccesstokenClaims struct {
	*jwt.MapClaims
	Upn         string
	Name        string
	Email       string
	Roles       []string
	Exp         int64
	Description string
	Company     string
}

type CmigRefreshtokenClaims struct {
	*jwt.MapClaims
	Upn string
	Exp int64
}

var (
	user                *CmigUser
	cmigAuthSetting     CmigAuthSetting
	encryptionKey       []byte
	USER_AUTH_CONF_PATH = os.Getenv("USER_AUTH_CONF_PATH")
	USER_AUTH_DATA_PATH = os.Getenv("USER_AUTH_DATA_PATH")
)

func init() {
	data, err := os.ReadFile(USER_AUTH_CONF_PATH)
	if err != nil {
		log.Fatalf("error: %v", err)
	}
	log.Printf("Load User confing from USER_AUTH_CONF_PATH ")

	err = yaml.Unmarshal(data, &cmigAuthSetting)
	if err != nil {
		log.Fatalf("error: %v", err)
	}

	hash := sha256.New()
	if cmigAuthSetting.Setting.Encryptionkey == "" {
		log.Fatalf("error: %v", fmt.Errorf("encryptionkey is not provided"))
	}
	hash.Write([]byte(cmigAuthSetting.Setting.Encryptionkey))
	encryptionKey = hash.Sum(nil)

	user, err = loadUserFromEncryptedFile()
	if err != nil {
		log.Printf("Load User From Encrypted File Fail : %v\n", err)
		log.Printf("Trying to init user from %v\n", USER_AUTH_CONF_PATH)

		password := cmigAuthSetting.User.Password
		hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
		user := &CmigUser{
			Id:          cmigAuthSetting.User.Id,
			Password:    string(hashedPassword),
			FirstName:   cmigAuthSetting.User.FirstName,
			LastName:    cmigAuthSetting.User.LastName,
			Roles:       cmigAuthSetting.User.Roles,
			Email:       cmigAuthSetting.User.Email,
			Description: cmigAuthSetting.User.Description,
			Company:     cmigAuthSetting.User.Company,
		}

		err := saveUserToEncryptedFile(user)
		if err != nil {
			log.Fatalf("Error saving user: %v\n", err)
		}

		user, err = loadUserFromEncryptedFile()
		if err != nil {
			log.Fatalf("Load User From Encrypted File Fail : %v\n", err)
		}

		log.Println("User create success")
	}

	log.Println("User init success")
}

func loadUserFromEncryptedFile() (*CmigUser, error) {
	encryptedData, err := os.ReadFile(USER_AUTH_DATA_PATH)
	if err != nil {
		return nil, err
	}

	block, err := aes.NewCipher(encryptionKey)
	if err != nil {
		return nil, err
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return nil, err
	}

	nonceSize := gcm.NonceSize()
	nonce, ciphertext := encryptedData[:nonceSize], encryptedData[nonceSize:]

	decryptedData, err := gcm.Open(nil, nonce, ciphertext, nil)
	if err != nil {
		return nil, err
	}

	var user CmigUser
	err = json.Unmarshal(decryptedData, &user)
	if err != nil {
		return nil, err
	}

	return &user, nil
}

func saveUserToEncryptedFile(user *CmigUser) error {
	userData, err := json.Marshal(user)
	if err != nil {
		return err
	}

	block, err := aes.NewCipher(encryptionKey)
	if err != nil {
		return err
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return err
	}

	nonce := make([]byte, gcm.NonceSize())
	if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
		return err
	}

	encryptedData := gcm.Seal(nonce, nonce, userData, nil)

	return os.WriteFile(USER_AUTH_DATA_PATH, encryptedData, 0644)
}

func generateJWT() (*CmigUserLoginResponse, error) {
	UserLoginRes := &CmigUserLoginResponse{}

	exp := time.Now().Add(tokenExpired).Unix()

	claims := CmigAccesstokenClaims{
		Upn:         user.Id,
		Name:        user.LastName + " " + user.FirstName,
		Roles:       user.Roles,
		Email:       user.Email,
		Description: user.Description,
		Company:     user.Company,
		Exp:         exp,
		MapClaims: &jwt.MapClaims{
			"exp": exp,
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signedToken, err := token.SignedString(encryptionKey)
	if err != nil {
		return nil, err
	}
	UserLoginRes.Accesstoken = signedToken
	UserLoginRes.ExpiresIn = exp

	refreshExp := time.Now().Add(refreshTokenExpired).Unix()
	refreshClaims := CmigRefreshtokenClaims{
		Exp: refreshExp,
		Upn: user.Id,
		MapClaims: &jwt.MapClaims{
			"exp": refreshExp,
		},
	}
	refreshToken := jwt.NewWithClaims(jwt.SigningMethodHS256, refreshClaims)
	signedRefreshToken, err := refreshToken.SignedString(encryptionKey)
	if err != nil {
		return nil, err
	}
	UserLoginRes.RefreshToken = signedRefreshToken
	UserLoginRes.RefreshExpiresIn = refreshExp

	return UserLoginRes, nil
}

func GetUserToken(id string, password string) (*CmigUserLoginResponse, error) {
	if user.Id == id {
		err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password))
		if err != nil {
			return nil, fmt.Errorf("unauthorized")
		}
		return generateJWT()
	}
	return nil, fmt.Errorf("unauthorized")
}

func RefreshAccessToken(refreshToken string) (*CmigUserLoginResponse, error) {
	token, err := jwt.ParseWithClaims(refreshToken, &CmigRefreshtokenClaims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return encryptionKey, nil
	})
	if err != nil {
		return nil, fmt.Errorf("token is invalid : %s", err.Error())
	}
	if claims, ok := token.Claims.(*CmigRefreshtokenClaims); ok && token.Valid {
		if time.Now().Unix() > claims.Exp {
			return nil, fmt.Errorf("refresh token expired")
		}
		return generateJWT()
	} else {
		return nil, fmt.Errorf("token is invalid")
	}
}

func GetRefreshTokenClaims(tokenString string) (*CmigRefreshtokenClaims, error) {
	log.Println("GetRefreshTokenClaims calls")
	token, err := jwt.ParseWithClaims(tokenString, &CmigRefreshtokenClaims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return encryptionKey, nil
	})
	if err != nil {
		return nil, err
	}
	if claims, ok := token.Claims.(*CmigRefreshtokenClaims); ok && token.Valid {
		return claims, nil
	} else {
		return nil, fmt.Errorf("token is invalid")
	}
}

func GetTokenClaims(tokenString string) (*CmigAccesstokenClaims, error) {
	log.Println("GetTokenClaims calls")
	token, err := jwt.ParseWithClaims(tokenString, &CmigAccesstokenClaims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return encryptionKey, nil
	})
	if err != nil {
		return nil, err
	}
	if claims, ok := token.Claims.(*CmigAccesstokenClaims); ok && token.Valid {
		return claims, nil
	} else {
		return nil, fmt.Errorf("token is invalid")
	}
}
