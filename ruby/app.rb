require 'sinatra'
require 'oauth2'
require 'json'
enable :sessions

#-- Run command $ ruby app.rb
#-- https://github.com/intridea/oauth2

#------ Vars
$myClientID = "fd61cf74-fb0c-45eb-b97a-f49602254023"
$myClientSecret = "c492346f-790f-4934-b773-c8a163deab41"
$oAuthProviderSite = "http://localhost:3000"
$access_token = nil

def myRedirectUri
  uri = URI.parse(request.url)
  uri.path = '/oauth/callback'
  uri.query = nil
  uri.to_s
end

def myRedirectUriUser
  uri = URI.parse(request.url)
  uri.path = '/oauth/callbackuser'
  uri.query = nil
  uri.to_s
end

#------ Handlers
def client
  OAuth2::Client.new($myClientID, $myClientSecret, :site => $oAuthProviderSite)
end

get "/" do
  erb :welcome
end

get "/auth" do
  redirect client.auth_code.authorize_url(:redirect_uri => myRedirectUri)
end

get '/oauth/callback' do
  $access_token = client.auth_code.get_token(params[:code], :redirect_uri => myRedirectUriUser)
  session[:access_token] = $access_token.token
  @message = "Successfully authenticated with the server."
  @token = $access_token.token
  erb :success
end

get "/getUser" do
  response = $access_token.get('/oauth/user', :params => { })
  @message = "Successfully retrieved user info from the server."
  @userObj = response.body
  @userObjPretty = JSON.pretty_generate(JSON.parse(response.body))

  puts JSON.pretty_generate(JSON.parse(response.body))

  erb :successUser
end

get '/oauth/callbackuser' do
  @message = get_response('data.json')
  erb :successUser
end

def get_response(url)
  access_token = OAuth2::AccessToken.new(client, session[:access_token])
  p access_token
  JSON.parse(access_token.get("/api/v1/#{url}").body)
end


